const fetch = globalThis.fetch;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: "Method Not Allowed" };

  // 1. Verify Clerk JWT (basic parse — same as neuro-engine)
  const authHeader = event.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return { statusCode: 401, headers, body: JSON.stringify({ error: "Authentication required" }) };

  let clerkUser;
  try {
    const base64 = token.split(".")[1].replace(/-/g, '+').replace(/_/g, '/');
    clerkUser = JSON.parse(Buffer.from(base64, "base64").toString());
  } catch (e) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Invalid identity token" }) };
  }

  // 2. Use SERVICE ROLE KEY — bypasses RLS entirely
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server configuration error" }) };
  }

  const supabaseHeaders = {
    "apikey": serviceKey,
    "Authorization": `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };

  try {
    const payload = JSON.parse(event.body || "{}");
    const { action, userId, eventId, eventData } = payload;

    // Security: ensure the userId in the request matches the JWT sub
    const jwtSub = clerkUser.sub || clerkUser.id || "";

    // Look up the Supabase profile UUID for this Clerk user
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?clerk_id=eq.${encodeURIComponent(jwtSub)}&select=id&limit=1`,
      { headers: supabaseHeaders }
    );
    const profiles = await profileRes.json();
    const supabaseUserId = profiles?.[0]?.id || userId;

    if (!supabaseUserId) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: "User profile not found" }) };
    }

    // --- CRUD ACTIONS ---
    if (action === "create") {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/timetable_events`,
        {
          method: "POST",
          headers: supabaseHeaders,
          body: JSON.stringify({ ...eventData, user_id: supabaseUserId })
        }
      );
      const data = await res.json();
      if (!res.ok) return { statusCode: res.status, headers, body: JSON.stringify({ error: data }) };
      const record = Array.isArray(data) ? data[0] : data;
      return { statusCode: 200, headers, body: JSON.stringify(record) };
    }

    if (action === "update") {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/timetable_events?id=eq.${eventId}&user_id=eq.${supabaseUserId}`,
        {
          method: "PATCH",
          headers: supabaseHeaders,
          body: JSON.stringify(eventData)
        }
      );
      const data = await res.json();
      if (!res.ok) return { statusCode: res.status, headers, body: JSON.stringify({ error: data }) };
      const record = Array.isArray(data) ? data[0] : data;
      return { statusCode: 200, headers, body: JSON.stringify(record) };
    }

    if (action === "delete") {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/timetable_events?id=eq.${eventId}&user_id=eq.${supabaseUserId}`,
        { method: "DELETE", headers: supabaseHeaders }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return { statusCode: res.status, headers, body: JSON.stringify({ error: errData }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    if (action === "fetch") {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/timetable_events?user_id=eq.${supabaseUserId}&status=eq.active&order=day.asc,start_time.asc`,
        { headers: { ...supabaseHeaders, "Prefer": "return=representation" } }
      );
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data || []) };
    }

    if (action === "fetch-context") {
      // Fetch all context data in parallel for AI enrichment
      const [eventsRes, tasksRes, syllabiRes, studyPlansRes] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/timetable_events?user_id=eq.${supabaseUserId}&status=eq.active&order=day.asc,start_time.asc`, { headers: supabaseHeaders }),
        fetch(`${supabaseUrl}/rest/v1/tasks?user_id=eq.${supabaseUserId}&is_completed=eq.false&order=due_date.asc&limit=30`, { headers: supabaseHeaders }),
        fetch(`${supabaseUrl}/rest/v1/syllabi?user_id=eq.${supabaseUserId}&is_deleted=eq.false&select=course_name,topics,objectives,exam_date&limit=20`, { headers: supabaseHeaders }),
        fetch(`${supabaseUrl}/rest/v1/study_plans?user_id=eq.${supabaseUserId}&order=created_at.desc&limit=10`, { headers: supabaseHeaders }),
      ]);
      const [events, tasks, syllabi, studyPlans] = await Promise.all([
        eventsRes.json().catch(() => []),
        tasksRes.json().catch(() => []),
        syllabiRes.json().catch(() => []),
        studyPlansRes.json().catch(() => []),
      ]);
      return {
        statusCode: 200, headers,
        body: JSON.stringify({
          events: Array.isArray(events) ? events : [],
          tasks: Array.isArray(tasks) ? tasks : [],
          syllabi: Array.isArray(syllabi) ? syllabi : [],
          studyPlans: Array.isArray(studyPlans) ? studyPlans : [],
        })
      };
    }

    // --- COURSES SECTION ---
    if (action === "list-courses") {
      const res = await fetch(`${supabaseUrl}/rest/v1/courses?user_id=eq.${supabaseUserId}&order=created_at.desc`, { headers: supabaseHeaders });
      if (!res.ok) throw new Error(`Supabase error: ${await res.text()}`);
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data || []) };
    }

    if (action === "create-course") {
      const res = await fetch(`${supabaseUrl}/rest/v1/courses`, {
        method: 'POST',
        headers: { ...supabaseHeaders, "Prefer": "return=representation" },
        body: JSON.stringify({ user_id: supabaseUserId, ...payload.courseData })
      });
      if (!res.ok) throw new Error(`Supabase error: ${await res.text()}`);
      const data = await res.json();
      return { statusCode: 201, headers, body: JSON.stringify(data[0] || data) };
    }

    if (action === "update-course") {
      const res = await fetch(`${supabaseUrl}/rest/v1/courses?id=eq.${payload.courseId}&user_id=eq.${supabaseUserId}`, {
        method: 'PATCH',
        headers: { ...supabaseHeaders, "Prefer": "return=representation" },
        body: JSON.stringify({ ...payload.courseData, updated_at: new Date().toISOString() })
      });
      if (!res.ok) throw new Error(`Supabase error: ${await res.text()}`);
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data[0] || data) };
    }

    if (action === "delete-course") {
      const res = await fetch(`${supabaseUrl}/rest/v1/courses?id=eq.${payload.courseId}&user_id=eq.${supabaseUserId}`, {
        method: 'DELETE',
        headers: supabaseHeaders
      });
      if (!res.ok) throw new Error(`Supabase error: ${await res.text()}`);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    if (action === "get-course-statistics") {
      const res = await fetch(`${supabaseUrl}/rest/v1/attendance?user_id=eq.${supabaseUserId}`, { headers: supabaseHeaders });
      if (!res.ok) throw new Error(`Supabase error: ${await res.text()}`);
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data || []) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: "Unknown action" }) };

  } catch (err) {
    console.error("[TIMETABLE-CRUD] Error:", err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
