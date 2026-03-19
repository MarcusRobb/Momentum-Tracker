const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

exports.addTopThreeTask = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      task_text,
      description,
      priority,
      score,
      tags,
      income_generating,
      eisenhower_quadrant,
      reasoning,
      scheduled_time,
      duration_mins,
      date_added,
    } = req.body;

    const today = date_added || new Date().toISOString().split("T")[0];
    const docKey = `timeboxing-topThree${today}`;
    const uid = "yvggs05n0AR0yBMVtTjHQEibpLv1";

    const docRef = admin.firestore()
      .collection("users")
      .doc(uid)
      .collection("appData")
      .doc(docKey);

    const docSnap = await docRef.get();
    const existing = docSnap.exists ? (docSnap.data().value || []) : [];

    const newTask = {
      id: `ai-${Date.now()}`,
      text: task_text,
      description: description || "",
      priority: priority || "1",
      score: score || null,
      tags: tags ? tags.split(",").map(t => t.trim()) : [],
      isIncomeGenerating: income_generating === "TRUE" || income_generating === true,
      urgency: eisenhower_quadrant || "urgent-important",
      reasoning: reasoning || "",
      scheduledTime: scheduled_time || "",
      duration: duration_mins ? Number(duration_mins) * 60 : 3600,
      isCompleted: false,
      source: "ai",
      notes: "",
    };

    const updated = [...existing, newTask];
    await docRef.set({ value: updated });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});
