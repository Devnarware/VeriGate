import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Search,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";
import { api } from "../utils/api";

function RiskBadge({ risk }) {
  const r = (risk || "HIGH").toLowerCase();
  return <span className={`risk-badge ${r}`}>{risk}</span>;
}

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    name: "",
    documentNumber: "",
    nationality: "",
    reason: "",
    riskLevel: "HIGH",
    source: "Border Security Intelligence Advisory",
    status: "ACTIVE",
  });

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      const res = await api.getWatchlist();
      if (res?.data) {
        setWatchlist(res.data);
      }
    } catch (err) {
      console.error("Error loading watchlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.searchWatchlist(searchQuery);
      if (res?.data) {
        setWatchlist(res.data);
      }
    } catch (err) {
      console.error("Error searching watchlist:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createWatchlistEntry(newEntry);
      if (res?.data) {
        setWatchlist((prev) => [res.data, ...prev]);
        setShowAddModal(false);
        setNewEntry({
          name: "",
          documentNumber: "",
          nationality: "",
          reason: "",
          riskLevel: "HIGH",
          source: "Border Security Intelligence Advisory",
          status: "ACTIVE",
        });
      }
    } catch (err) {
      alert(`Could not add watchlist entry: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this entry from the prototype watchlist?")) return;
    try {
      await api.deleteWatchlistEntry(id);
      setWatchlist((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(`Could not delete entry: ${err.message}`);
    }
  };

  return (
    <div className="watchlist-page">
      {/* PAGE HEADING */}
      <section className="page-heading">
        <div>
          <span className="eyebrow">INTELLIGENCE & LOOKUP</span>
          <h1>Prototype Watchlist</h1>
          <p>Local simulation of Interpol, immigration, and border enforcement watchlists.</p>
        </div>

        <button className="primary-button" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Watchlist Entry
        </button>
      </section>

      {/* PROTOTYPE DISCLAIMER BANNER */}
      <div className="prototype-disclaimer-card">
        <Info size={18} />
        <div>
          <strong>Prototype Security Intelligence Database</strong>
          <p>
            Notice: For SIH prototype demonstration, this module uses synthetic and mock border watchlist data.
            It does not connect to classified government databases.
          </p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="cases-filter-bar">
        <form onSubmit={handleSearch} className="cases-search-form">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search Subject Name, Passport Number, National ID, or Nationality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="secondary-button filter-btn">
            Search Watchlist
          </button>
        </form>
      </div>

      {/* TABLE */}
      <div className="panel cases-table-panel">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Entry ID</th>
                <th>Subject Name</th>
                <th>Document No.</th>
                <th>Nationality</th>
                <th>Risk Level</th>
                <th>Alert Reason</th>
                <th>Source Advisory</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-6">
                    Loading watchlist...
                  </td>
                </tr>
              ) : watchlist.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-6 muted">
                    No watchlist entries match your query.
                  </td>
                </tr>
              ) : (
                watchlist.map((item) => (
                  <tr key={item.id}>
                    <td className="screening-id">{item.id}</td>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>{item.documentNumber}</td>
                    <td>{item.nationality}</td>
                    <td>
                      <RiskBadge risk={item.riskLevel} />
                    </td>
                    <td className="watchlist-reason-col">{item.reason}</td>
                    <td>
                      <small className="muted">{item.source}</small>
                    </td>
                    <td>
                      <span className={`status-pill ${item.status?.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="icon-button text-danger"
                        onClick={() => handleDelete(item.id)}
                        title="Delete entry"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ENTRY MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-header">
                <div>
                  <span className="eyebrow">BORDER ADVISORY ENTRY</span>
                  <h2>Add Watchlist Subject</h2>
                </div>
                <button type="button" className="icon-button" onClick={() => setShowAddModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body form-grid">
                <div className="form-field">
                  <label>Subject Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newEntry.name}
                    onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div className="form-field">
                  <label>Document Number *</label>
                  <input
                    type="text"
                    required
                    value={newEntry.documentNumber}
                    onChange={(e) => setNewEntry({ ...newEntry, documentNumber: e.target.value })}
                    placeholder="e.g. P9012488"
                  />
                </div>

                <div className="form-field">
                  <label>Nationality</label>
                  <input
                    type="text"
                    value={newEntry.nationality}
                    onChange={(e) => setNewEntry({ ...newEntry, nationality: e.target.value })}
                    placeholder="e.g. German"
                  />
                </div>

                <div className="form-field">
                  <label>Risk Level</label>
                  <select
                    value={newEntry.riskLevel}
                    onChange={(e) => setNewEntry({ ...newEntry, riskLevel: e.target.value })}
                  >
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div className="form-field full-width">
                  <label>Reason for Advisory Alert *</label>
                  <input
                    type="text"
                    required
                    value={newEntry.reason}
                    onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
                    placeholder="e.g. Stolen travel credential / Identity manipulation flag"
                  />
                </div>

                <div className="form-field full-width">
                  <label>Source / Issuing Agency</label>
                  <input
                    type="text"
                    value={newEntry.source}
                    onChange={(e) => setNewEntry({ ...newEntry, source: e.target.value })}
                    placeholder="e.g. Interpol Red Notice / Consular Alert"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save to Watchlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
