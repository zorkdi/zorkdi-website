const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
admin.initializeApp();

// 1. CHAT TRIGGER (Notification + Unread Count)
exports.sendChatNotification = onDocumentCreated("chats/{userId}/messages/{messageId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;
    
    const messageData = snapshot.data();
    const userId = event.params.userId;

    // Agar User ne khud message bheja hai, toh kuch mat karo
    if (messageData.senderId === userId) return null;

    console.log(`New Admin message for User: ${userId}`);

    const db = admin.firestore();

    // --- FIX: Increment Unread Count automatically ---
    // Jab Admin message karega, User ke chat document mein count +1 ho jayega
    await db.collection("chats").doc(userId).set({
        unreadCount: admin.firestore.FieldValue.increment(1),
        lastMessage: messageData.text || "Image/File",
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // --- Notification Logic (Same as before) ---
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();

    if (!userData || !userData.fcmToken) {
        console.log("No FCM Token found.");
        return null;
    }

    const message = {
        notification: {
            title: "ZORK DI Support",
            body: messageData.text || "New Message",
        },
        data: {
            title: "ZORK DI Support",
            body: messageData.text || "New Message",
            type: "chat",
            projectId: "general_support"
        },
        token: userData.fcmToken
    };

    try {
        return await admin.messaging().send(message);
    } catch (error) {
        console.error("Error sending notification:", error);
        return null;
    }
});

// 2. PROJECT UPDATE TRIGGER (Same as before)
exports.sendProjectUpdateNotification = onDocumentUpdated("projects/{projectId}", async (event) => {
    // ... (Purana code same rahega)
    const newData = event.data.after.data();
    const oldData = event.data.before.data();

    if (newData.status !== oldData.status) {
        const userId = newData.userId;
        const projectTitle = newData.title || "Project";
        const statusText = newData.status.toUpperCase();

        const userDoc = await admin.firestore().collection("users").doc(userId).get();
        const userData = userDoc.data();

        if (!userData || !userData.fcmToken) return null;

        const message = {
            notification: {
                title: "Project Update",
                body: `Your project '${projectTitle}' is now ${statusText}.`,
            },
            data: {
                title: "Project Update",
                body: `Status changed to ${statusText}`,
                type: "project",
                projectId: event.params.projectId
            },
            token: userData.fcmToken
        };
        return admin.messaging().send(message);
    }
    return null;
});