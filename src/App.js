import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [username, setUsername] = useState('');
  const [cheaterStatus, setCheaterStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkForCheating = async () => {
    setLoading(true);
    setCheaterStatus(null);

    try {
      const response = await axios.get(
        `https://codeforces.com/api/user.status?handle=${username}`
      );

      const submissions = response.data.result;
      const contests = {};

      // Organize submissions by contestId and record verdicts
      submissions.forEach((submission) => {
        const { contestId, verdict } = submission;
        if (!contests[contestId]) {
          contests[contestId] = [];
        }
        contests[contestId].push(verdict);
      });

      // Detect suspicious contests
      const suspiciousContests = [];
      for (const [contestId, verdicts] of Object.entries(contests)) {
        // Check if every verdict in this contest is "SKIPPED"
        if (verdicts.length > 0 && verdicts.every(verdict => verdict === "SKIPPED")) {
          suspiciousContests.push(contestId);
        }
      }

      setCheaterStatus({
        isCheater: suspiciousContests.length > 0,
        contests: suspiciousContests,
      });
    } catch (error) {
      console.error("Error fetching data from Codeforces API", error);
      alert("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Codeforces Cheating Detector</h1>
      
      <input
        type="text"
        placeholder="Enter Codeforces username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border-2 border-gray-300 rounded-md p-2 mb-4 w-64"
      />
      
      <button
        onClick={checkForCheating}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? 'Checking...' : 'Check for Cheating'}
      </button>

      {cheaterStatus && (
        <div className="mt-6">
          {cheaterStatus.isCheater ? (
            <div>
              <p className="text-red-600 font-semibold text-xl">
                Suspicious Activity Detected!
              </p>
              <p className="text-gray-700 mt-2">
                This user has skipped contests with IDs:
              </p>
              <ul className="text-gray-700 list-disc list-inside">
                {cheaterStatus.contests.map((contestId) => (
                  <li key={contestId}>Contest ID: {contestId}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-green-600 font-semibold text-xl">
              No suspicious activity detected!
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
