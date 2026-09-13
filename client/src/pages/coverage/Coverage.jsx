import React, { useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Phone,
  Building2,
  MapPinned,
  X,
  ChevronRight,
} from "lucide-react";

import BranchMap from "../../components/BranchMap/BranchMap";
import branches from "../../data/branches";

const divisions = [
  "All Divisions",
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

const Coverage = () => {
  const [search, setSearch] = useState("");
  const [selectedDivision, setSelectedDivision] =
    useState("All Divisions");

  const [selectedBranch, setSelectedBranch] = useState(null);

  const filteredBranches = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return branches.filter((branch) => {
      const matchesDivision =
        selectedDivision === "All Divisions" ||
        branch.division === selectedDivision;

      const matchesSearch =
        !searchText ||
        branch.name.toLowerCase().includes(searchText) ||
        branch.district.toLowerCase().includes(searchText) ||
        branch.division.toLowerCase().includes(searchText) ||
        branch.address.toLowerCase().includes(searchText);

      return matchesDivision && matchesSearch;
    });
  }, [search, selectedDivision]);

  const handleSelectBranch = (branch) => {
    setSelectedBranch(branch);
  };

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <main className="w-full bg-[var(--primary)]">

      {/* ================= HERO ================= */}
      <section className="px-4 pt-16 pb-12 md:pt-20 md:pb-16">
        <div className="max-w-7xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--secondary)] text-[var(--foreground)] text-sm font-medium mb-5">
            <MapPinned size={17} />
            Nationwide Coverage
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--foreground)] leading-tight">
            We Deliver Across{" "}
            <span className="text-[var(--secondary)]">
              Bangladesh
            </span>
          </h1>

          <p className="max-w-2xl mx-auto mt-5 text-[var(--text)] opacity-80 text-base md:text-lg">
            Find our nearest branch, delivery hub, or service
            location and experience fast, reliable parcel delivery
            wherever you are.
          </p>

        </div>
      </section>

      {/* ================= COVERAGE LOCATOR ================= */}
      <section className="px-4 pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto">

          <div className="bg-[var(--foreground)] rounded-3xl shadow-xl overflow-hidden">

            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr]">

              {/* ================= LEFT PANEL ================= */}
              <div className="p-5 md:p-6 border-b lg:border-b-0 lg:border-r border-[var(--text)]/10">

                {/* Heading */}
                <div className="mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[var(--secondary)] flex items-center justify-center">
                      <MapPin
                        size={21}
                        className="text-[var(--foreground)]"
                      />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-[var(--text)]">
                        Find a Location
                      </h2>

                      <p className="text-sm text-[var(--text)] opacity-60">
                        Search our delivery network
                      </p>
                    </div>
                  </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text)] opacity-50"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        filteredBranches.length > 0
                      ) {
                        handleSelectBranch(filteredBranches[0]);
                      }
                    }}
                    placeholder="Search district, branch or area..."
                    className="w-full h-12 pl-11 pr-10 rounded-xl bg-[var(--primary)] text-[var(--text)] outline-none border border-transparent focus:border-[var(--secondary)] transition"
                  />

                  {search && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--secondary)] transition"
                    >
                      <X size={17} />
                    </button>
                  )}
                </div>

                {/* Division Filter */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Division
                  </label>

                  <select
                    value={selectedDivision}
                    onChange={(e) => {
                      setSelectedDivision(e.target.value);
                      setSelectedBranch(null);
                    }}
                    className="w-full h-11 px-4 rounded-xl bg-[var(--primary)] text-[var(--text)] border border-transparent focus:border-[var(--secondary)] outline-none cursor-pointer"
                  >
                    {divisions.map((division) => (
                      <option
                        key={division}
                        value={division}
                      >
                        {division}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Results Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-[var(--text)]">
                      Available Locations
                    </h3>

                    <p className="text-xs text-[var(--text)] opacity-60 mt-1">
                      {filteredBranches.length} location
                      {filteredBranches.length !== 1 ? "s" : ""} found
                    </p>
                  </div>

                  <Building2
                    size={19}
                    className="text-[var(--secondary)]"
                  />
                </div>

                {/* Branch List */}
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">

                  {filteredBranches.length > 0 ? (
                    filteredBranches.map((branch) => (
                      <button
                        key={branch.id}
                        onClick={() => handleSelectBranch(branch)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group ${
                          selectedBranch?.id === branch.id
                            ? "bg-[var(--secondary)] border-[var(--secondary)]"
                            : "bg-[var(--primary)] border-transparent hover:border-[var(--secondary)] hover:-translate-y-0.5"
                        }`}
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            <h4
                              className={`font-semibold truncate ${
                                selectedBranch?.id === branch.id
                                  ? "text-[var(--foreground)]"
                                  : "text-[var(--text)]"
                              }`}
                            >
                              {branch.name}
                            </h4>

                            <p
                              className={`text-xs mt-1 ${
                                selectedBranch?.id === branch.id
                                  ? "text-[var(--foreground)] opacity-70"
                                  : "text-[var(--text)] opacity-60"
                              }`}
                            >
                              {branch.district},{" "}
                              {branch.division}
                            </p>

                            <div
                              className={`flex items-start gap-2 mt-3 text-xs ${
                                selectedBranch?.id === branch.id
                                  ? "text-[var(--foreground)]"
                                  : "text-[var(--text)] opacity-70"
                              }`}
                            >
                              <MapPin
                                size={14}
                                className="mt-0.5 shrink-0"
                              />

                              <span className="line-clamp-2">
                                {branch.address}
                              </span>
                            </div>

                          </div>

                          <ChevronRight
                            size={18}
                            className={`shrink-0 transition-transform group-hover:translate-x-1 ${
                              selectedBranch?.id === branch.id
                                ? "text-[var(--foreground)]"
                                : "text-[var(--text)] opacity-50"
                            }`}
                          />

                        </div>

                      </button>
                    ))
                  ) : (
                    <div className="text-center py-12 px-4">
                      <div className="w-14 h-14 mx-auto rounded-full bg-[var(--primary)] flex items-center justify-center mb-4">
                        <Search
                          size={24}
                          className="text-[var(--text)] opacity-50"
                        />
                      </div>

                      <h4 className="font-semibold text-[var(--text)]">
                        No location found
                      </h4>

                      <p className="text-sm text-[var(--text)] opacity-60 mt-1">
                        Try searching another district or branch.
                      </p>
                    </div>
                  )}

                </div>

              </div>

              {/* ================= MAP ================= */}
              <div className="min-h-[500px] lg:min-h-[680px]">
                <BranchMap
                  branches={filteredBranches}
                  selectedBranch={selectedBranch}
                  onSelectBranch={handleSelectBranch}
                />
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="px-4 pb-16 md:pb-20">
        <div className="max-w-5xl mx-auto ">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div className="p-6 rounded-2xl bg-[var(--foreground)] text-center shadow-sm">
              <h3 className="text-3xl md:text-4xl font-bold text-[var(--secondary)]">
                64
              </h3>

              <p className="mt-2 text-sm text-[var(--secondary)] opacity-70">
                Districts Covered
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--foreground)] text-center shadow-sm">
              <h3 className="text-3xl md:text-4xl font-bold text-[var(--secondary)]">
                8
              </h3>

              <p className="mt-2 text-sm text-[var(--secondary)] opacity-70">
                Divisions Reached
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--foreground)] text-center shadow-sm">
              <h3 className="text-3xl md:text-4xl font-bold text-[var(--secondary)]">
                100%
              </h3>

              <p className="mt-2 text-sm text-[var(--secondary)] opacity-70">
                Nationwide Delivery
              </p>
            </div>

          </div>

        </div>
      </section>

    </main>
  );
};

export default Coverage;