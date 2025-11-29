import React, { useEffect, useState } from "react";

export default function CustodyTimeline({ er, evidenceId, goBack }) {
  const [events, setEvents] = useState([]);

  async function loadTimeline() {
    const filter = er.filters.CustodyTransferred(evidenceId);
    const logs = await er.queryFilter(filter);

    const timeline = logs.map((log) => {
      const { from, to, timestamp } = log.args;
      return {
        from,
        to,
        time: new Date(Number(timestamp) * 1000).toLocaleString(),
      };
    });

    setEvents(timeline);
  }

  useEffect(() => {
    loadTimeline();
  }, [evidenceId]);

  return (
    <div style={{ padding: "10px", border: "1px solid #ccc" }}>
      <button onClick={goBack}>Back</button>
      <h3>Custody Timeline for Evidence {evidenceId}</h3>

      {events.length === 0 && <p>No custody transfers yet.</p>}

      {events.map((e, i) => (
        <div key={i} style={{ marginBottom: "8px" }}>
          <strong>{i + 1}. </strong>
          {e.from} → {e.to}
          <br />
          <small>{e.time}</small>
        </div>
      ))}
    </div>
  );
}
