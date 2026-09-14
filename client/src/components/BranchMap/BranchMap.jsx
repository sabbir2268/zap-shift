import React, { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import {
  MapPin,
  Phone,
  Building2,
} from "lucide-react";

import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MapController = ({
  selectedBranch,
  markerRefs,
}) => {
  const map = useMap();

  useEffect(() => {
    if (!selectedBranch) return;

    map.flyTo(
      selectedBranch.position,
      13,
      {
        duration: 1.2,
      }
    );

    const timer = setTimeout(() => {
      const marker =
        markerRefs.current[selectedBranch.id];

      if (marker) {
        marker.openPopup();
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [selectedBranch, map, markerRefs]);

  return null;
};

const BranchMap = ({
  branches,
  selectedBranch,
  onSelectBranch,
}) => {
  const markerRefs = useRef({});

  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-[680px]">

      {/* Map */}
      <MapContainer
        center={[23.685, 90.3563]}
        zoom={7}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[500px] lg:min-h-[680px] z-0"
      >

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          selectedBranch={selectedBranch}
          markerRefs={markerRefs}
        />

        {branches.map((branch) => (
          <Marker
            key={branch.id}
            position={branch.position}
            ref={(ref) => {
              if (ref) {
                markerRefs.current[branch.id] = ref;
              }
            }}
            eventHandlers={{
              click: () => {
                onSelectBranch(branch);
              },
            }}
          >
            <Popup>

              <div className="min-w-[220px]">

                <h3 className="font-bold text-base mb-1">
                  {branch.name}
                </h3>

                <p className="text-xs text-gray-500 mb-3">
                  {branch.district},{" "}
                  {branch.division}
                </p>

                <div className="flex items-start gap-2 text-sm mb-2">
                  <MapPin
                    size={15}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    {branch.address}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Phone
                    size={15}
                    className="shrink-0"
                  />

                  <span>
                    {branch.phone}
                  </span>
                </div>

              </div>

            </Popup>
          </Marker>
        ))}

      </MapContainer>

      {/* Map Overlay */}
      <div className="absolute top-4 left-4 z-[1000]">

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--foreground)] shadow-lg">

          <div className="w-2.5 h-2.5 rounded-full bg-[var(--secondary)] animate-pulse" />

          <span className="text-sm font-medium text-[var(--primary)]">
            {branches.length} Locations
          </span>

        </div>

      </div>

      {/* Selected Branch Card */}
      {selectedBranch && (
        <div className="absolute bottom-5 left-5 right-5 md:left-auto md:w-[330px] z-[1000]">

          <div className="bg-[var(--foreground)] rounded-2xl p-4 shadow-xl border border-white/10">

            <div className="flex items-start gap-3">

              <div className="w-10 h-10 rounded-xl bg-[var(--secondary)] flex items-center justify-center shrink-0">
                <Building2
                  size={19}
                  className="text-[var(--foreground)]"
                />
              </div>

              <div className="min-w-0">

                <h3 className="font-bold text-[var(--primary)] truncate">
                  {selectedBranch.name}
                </h3>

                <p className="text-xs text-[var(--primary)]/70 mt-1">
                  {selectedBranch.district},{" "}
                  {selectedBranch.division}
                </p>

              </div>

            </div>

            <div className="flex items-start gap-2 mt-3">
              <MapPin
                size={15}
                className="mt-0.5 shrink-0 text-[var(--secondary)]"
              />

              <p className="text-sm text-[var(--primary)]/80">
                {selectedBranch.address}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Phone
                size={15}
                className="text-[var(--secondary)]"
              />

              <p className="text-sm text-[var(--primary)]/80">
                {selectedBranch.phone}
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default BranchMap;