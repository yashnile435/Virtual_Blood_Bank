import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Droplet,
  Phone,
  LogOut,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
} from "lucide-react";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Search State
  const [searchCity, setSearchCity] = useState("");
  const [searchGroup, setSearchGroup] = useState("A+");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  // Requests State
  const [myRequests, setMyRequests] = useState([]);
  const [myRequestsLoading, setMyRequestsLoading] = useState(false);

  // Booking State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [bookingMessage, setBookingMessage] = useState(null);
  const [bookingQuantity, setBookingQuantity] = useState(1);
  const [bookingFor, setBookingFor] = useState("SELF"); // 'SELF' or 'OTHER'
  const [patientName, setPatientName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [confirmDate, setConfirmDate] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchMyRequests = async (userId) => {
    setMyRequestsLoading(true);
    // We need blood bank name, so we join.
    // Supabase join syntax:
    const { data, error } = await supabase
      .from("blood_requests")
      .select(
        `
                *,
                blood_banks ( name )
            `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requests:", error);
    }

    if (data) setMyRequests(data);
    setMyRequestsLoading(false);
  };

  useEffect(() => {
    let channel;

    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          navigate("/user/login");
          return;
        }
        setUser(user);

        // Fetch user profile
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) console.error("Error fetching profile:", error);

        setUserData(data);
        if (data) setPatientName(data.name);

        await fetchMyRequests(user.id);

        // Realtime subscription for my requests
        channel = supabase
          .channel("realtime-my-requests")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "blood_requests",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              fetchMyRequests(user.id);
            },
          )
          .subscribe();
      } catch (err) {
        console.error("Error in dashboard initialization:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [navigate]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setSearched(true);
    setSearchResults([]);

    try {
      // Join blood_inventory with blood_banks
      // Since Supabase join syntax via API is specific, we might do it in two steps or use correct select
      // Note: Assuming 'blood_inventory' has 'blood_bank_id' which is FK to 'blood_banks'

      const { data, error } = await supabase
        .from("blood_inventory")
        .select(
          `
                    id,
                    quantity,
                    blood_group,
                    blood_banks (
                        id,
                        name,
                        city,
                        phone,
                        address
                    )
                `,
        )
        .eq("blood_group", searchGroup)
        .gt("quantity", 0); // Only show available

      if (error) throw error;

      // Client-side filter for city if Supabase filtering on joined table is tricky without setup
      let results = data || [];
      if (searchCity.trim()) {
        results = results.filter((item) =>
          item.blood_banks.city
            .toLowerCase()
            .includes(searchCity.toLowerCase()),
        );
      }

      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const openBookingModal = (item) => {
    setSelectedBank(item);
    setBookingModalOpen(true);
    setBookingMessage(null);
    setBookingQuantity(1);
    setBookingFor("SELF");
    // Reset patient name if booking for myself
    if (userData) {
      setPatientName(userData.name);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!confirmDate) return;
    if (bookingQuantity > selectedBank.quantity) {
      setBookingMessage({
        type: "error",
        text: `Only ${selectedBank.quantity} units available.`,
      });
      return;
    }

    setBookingLoading(true);
    setBookingMessage(null);

    try {
      // 1. Create booking request
      const { error: requestError } = await supabase
        .from("blood_requests")
        .insert([
          {
            user_id: user.id,
            blood_bank_id: selectedBank.blood_banks.id,
            blood_group: selectedBank.blood_group,
            patient_name: patientName,
            hospital_name: hospitalName,
            hospital_address: hospitalAddress,
            required_within_30_days: confirmDate,
            status: "PENDING",
            quantity: bookingQuantity,
            booking_for: bookingFor,
          },
        ]);

      if (requestError) throw requestError;

      // No inventory update here - waits for approval

      setBookingMessage({
        type: "success",
        text: "Request submitted! Waiting for blood bank approval.",
      });

      // Refresh requests list
      fetchMyRequests(user.id);

      setSearchResults((prev) =>
        prev.map(
          (item) =>
            // item.id === selectedBank.id ? { ...item, quantity: newQuantity } : item
            item, // Do not reduce quantity locally yet
        ),
      );

      setTimeout(() => {
        setBookingModalOpen(false);
        setBookingMessage(null);
      }, 2500);
    } catch (err) {
      setBookingMessage({
        type: "error",
        text: "Booking failed. Please try again.",
      });
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/user/login");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading Dashboard...
      </div>
    );
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600 font-bold text-xl">
            <Droplet className="h-6 w-6" />
            <span>LifeSaver</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-800">
                {userData?.name || "User"}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 rounded-full hover:bg-red-50"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* My Requests Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="h-6 w-6 text-red-600" />
            My Blood Requests
          </h2>

          {myRequestsLoading ? (
            <div className="text-center py-6 text-gray-500">
              Loading history...
            </div>
          ) : myRequests.length === 0 ? (
            <p className="text-gray-500 text-sm">
              You haven't made any blood requests yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                    <th className="px-4 py-3">Blood Bank</th>
                    <th className="px-4 py-3">Group</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">For</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {myRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {req.blood_banks?.name || "Unknown Bank"}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-700">
                        {req.blood_group}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {req.quantity || 1}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-500">
                        {req.booking_for || "SELF"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`
                                                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize
                                                    ${
                                                      req.status === "APPROVED"
                                                        ? "bg-green-100 text-green-700"
                                                        : req.status ===
                                                            "REJECTED"
                                                          ? "bg-red-100 text-red-700"
                                                          : "bg-yellow-100 text-yellow-700"
                                                    }
                                                `}
                        >
                          {req.status === "APPROVED" && (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          {req.status === "REJECTED" && (
                            <XCircle className="h-3 w-3" />
                          )}
                          {req.status === "PENDING" && (
                            <Clock className="h-3 w-3" />
                          )}
                          {req.status.toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Search Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Search className="h-6 w-6 text-red-600" />
            Find Blood
          </h1>
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-12 gap-4"
          >
            <div className="md:col-span-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                City
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                  placeholder="Enter city name (e.g. New York)"
                />
              </div>
            </div>
            <div className="md:col-span-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Blood Group
              </label>
              <select
                value={searchGroup}
                onChange={(e) => setSearchGroup(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none appearance-none bg-white"
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3 flex items-end">
              <button
                type="submit"
                disabled={searchLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2"
              >
                {searchLoading ? (
                  "Searching..."
                ) : (
                  <>
                    <Search className="h-5 w-5" /> Search Availability
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Results Section */}
        {searched && (
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Search Results
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({searchResults.length}{" "}
                {searchResults.length === 1 ? "bank" : "banks"} found)
              </span>
            </h2>

            {searchResults.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <div className="inline-block p-4 rounded-full bg-gray-50 mb-3">
                  <Droplet className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-gray-500">
                  No blood banks found with <b>{searchGroup}</b> stock{" "}
                  {searchCity && `in ${searchCity}`}.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {item.blood_banks.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                          <MapPin className="h-4 w-4" />
                          {item.blood_banks.city}
                        </div>
                      </div>
                      <div className="bg-red-50 text-red-700 font-bold px-3 py-1 rounded-lg text-sm">
                        {item.blood_group}
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Available Units:</span>
                        <span className="font-bold text-gray-900">
                          {item.quantity} Bags
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        {item.blood_banks.phone}
                      </div>
                      <div className="text-xs text-gray-400 line-clamp-1">
                        {item.blood_banks.address}
                      </div>
                    </div>

                    <button
                      onClick={() => openBookingModal(item)}
                      className="w-full bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 font-bold py-2.5 rounded-xl transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Booking Modal */}
      {bookingModalOpen && selectedBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-900">
                Book Blood Unit
              </h3>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="p-6">
              {bookingMessage && (
                <div
                  className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${bookingMessage.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
                >
                  {bookingMessage.type === "error" ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <CheckCircle className="h-5 w-5" />
                  )}
                  <p className="text-sm font-medium">{bookingMessage.text}</p>
                </div>
              )}

              {/* Bank Details */}
              <div className="bg-red-50 p-4 rounded-xl mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-600">
                    Blood Bank
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {selectedBank.blood_banks.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-600">
                    Blood Group
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    {selectedBank.blood_group}
                  </span>
                </div>
              </div>

              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Booking For
                  </label>
                  <div className="flex gap-4">
                    <label
                      className={`flex items-center gap-2 cursor-pointer border p-3 rounded-lg w-full transition-colors ${bookingFor === "SELF" ? "border-red-200 bg-red-50" : "border-gray-200 hover:bg-gray-50"}`}
                    >
                      <input
                        type="radio"
                        name="bookingFor"
                        value="SELF"
                        checked={bookingFor === "SELF"}
                        onChange={(e) => {
                          setBookingFor(e.target.value);
                          setPatientName(userData.name);
                        }}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm font-medium">Myself</span>
                    </label>
                    <label
                      className={`flex items-center gap-2 cursor-pointer border p-3 rounded-lg w-full transition-colors ${bookingFor === "OTHER" ? "border-red-200 bg-red-50" : "border-gray-200 hover:bg-gray-50"}`}
                    >
                      <input
                        type="radio"
                        name="bookingFor"
                        value="OTHER"
                        checked={bookingFor === "OTHER"}
                        onChange={(e) => {
                          setBookingFor(e.target.value);
                          setPatientName("");
                        }}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm font-medium">Someone Else</span>
                    </label>
                  </div>
                </div>

                {/* Quantity Field */}
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Number of Units Required
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedBank.quantity}
                    required
                    value={bookingQuantity}
                    onChange={(e) =>
                      setBookingQuantity(parseInt(e.target.value))
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                  />
                  <p className="text-xs text-gray-500">
                    Available Stock: {selectedBank.quantity}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                    placeholder="Enter patient full name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">
                      Hospital Name
                    </label>
                    <input
                      type="text"
                      required
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                      placeholder="e.g. City General"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">
                      Hospital Address
                    </label>
                    <input
                      type="text"
                      required
                      value={hospitalAddress}
                      onChange={(e) => setHospitalAddress(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                      placeholder="Street, Area"
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-yellow-800 mb-1">
                      Important Notice
                    </p>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmDate}
                        onChange={(e) => setConfirmDate(e.target.checked)}
                        className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 rounded border-gray-300 shrink-0"
                      />
                      <span className="text-sm text-gray-700 leading-tight">
                        I confirm that this blood unit is required for a patient
                        within the next 30 days. Providing false information may
                        lead to account suspension.
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!confirmDate || bookingLoading}
                  className={`w-full py-3.5 rounded-xl text-white font-bold shadow-md transition-all duration-200 ${
                    !confirmDate || bookingLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 hover:shadow-lg"
                  }`}
                >
                  {bookingLoading ? "Processing Booking..." : "Confirm Booking"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
