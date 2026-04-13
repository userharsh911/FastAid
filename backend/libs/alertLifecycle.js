import Alert from "../model/alert.model.js";
import Volunteer from "../model/volunteer.model.js";

export const ALERT_CANCEL_REMINDER_AFTER_MS = 12 * 60 * 60 * 1000;
export const ALERT_AUTO_EXPIRE_AFTER_MS = 24 * 60 * 60 * 1000;

const getModifiedCount = (result) => {
    if (!result) return 0;
    return result.modifiedCount || result.nModified || 0;
};

export const getAlertLifecycleMeta = (alertDoc) => {
    if (!alertDoc?.createdAt) {
        return {
            ageMs: 0,
            ageHours: 0,
            needsCancelReminder: false,
            isExpired: false,
        };
    }

    const createdAtMs = new Date(alertDoc.createdAt).getTime();
    if (!Number.isFinite(createdAtMs)) {
        return {
            ageMs: 0,
            ageHours: 0,
            needsCancelReminder: false,
            isExpired: false,
        };
    }

    const ageMs = Math.max(0, Date.now() - createdAtMs);
    const ageHours = Number((ageMs / (60 * 60 * 1000)).toFixed(2));
    const isActive = alertDoc.mode === "Active";

    return {
        ageMs,
        ageHours,
        needsCancelReminder: isActive && ageMs >= ALERT_CANCEL_REMINDER_AFTER_MS && ageMs < ALERT_AUTO_EXPIRE_AFTER_MS,
        isExpired: isActive && ageMs >= ALERT_AUTO_EXPIRE_AFTER_MS,
    };
};

export const expireStaleActiveAlerts = async ({ userId } = {}) => {
    const expiryThreshold = new Date(Date.now() - ALERT_AUTO_EXPIRE_AFTER_MS);
    const query = {
        mode: "Active",
        createdAt: { $lte: expiryThreshold },
    };

    if (userId) {
        query.user_id = userId;
    }

    const staleAlerts = await Alert.find(query)
        .select("_id user_id volunteer_id")
        .lean();

    if (!staleAlerts.length) {
        return { expiredCount: 0, alertIds: [] };
    }

    const alertIds = staleAlerts.map((alert) => alert._id);
    const userIds = Array.from(
        new Set(
            staleAlerts
                .map((alert) => alert?.user_id?.toString())
                .filter(Boolean)
        )
    );
    const volunteerIds = staleAlerts
        .map((alert) => alert?.volunteer_id)
        .filter(Boolean);

    const volunteerIdsAsString = Array.from(
        new Set(volunteerIds.map((id) => id.toString()))
    );

    if (volunteerIds.length) {
        await Volunteer.updateMany(
            { _id: { $in: volunteerIds } },
            { $set: { mode: "Available" } }
        );
    }

    const updateResult = await Alert.updateMany(
        { _id: { $in: alertIds } },
        { $set: { mode: "Cancelled" } }
    );

    return {
        expiredCount: getModifiedCount(updateResult),
        alertIds: alertIds.map((id) => id.toString()),
        userIds,
        volunteerIds: volunteerIdsAsString,
    };
};
