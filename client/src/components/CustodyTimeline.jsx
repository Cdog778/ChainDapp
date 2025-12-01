import React, { useEffect, useState } from "react";

export default function CustodyTimeline({ er, evidenceId, goBack }) {
  const [events, setEvents] = useState([]);

  async function loadTimeline() {
    try {
      const filter = er.filters.CustodyTransferred(evidenceId);
      const logs = await er.queryFilter(filter);

      const parsed = logs.map((log) => {
        const { from, to, timestamp } = log.args;

        return {
          from,
          to,
          time: new Date(Number(timestamp.toString()) * 1000).toLocaleString()
        };
      });

      setEvents(parsed);
    } catch (err) {
      console.error(err);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadTimeline();
  }, [evidenceId]);

  return (
    <div className="card">
      <button className="backButton" onClick={goBack}>← Back</button>

      <h2>Custody Timeline</h2>

      {events.length === 0 ? (
        <p>No transfers yet.</p>
      ) : (
        events.map((e, i) => (
          <div key={i} className="noteRow">
            <strong>{i + 1}. </strong>
            {e.from} → {e.to}
            <br />
            <span style={{ fontSize: "0.85em", color: "#777" }}>{e.time}</span>
          </div>
        ))
      )}
    </div>
  );
}
