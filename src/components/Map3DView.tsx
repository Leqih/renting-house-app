import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { listings } from '../data/listings';
import type { StudentProfile } from '../data/profile';
import { matchScore, matchReasons } from '../data/profile';
import type { College } from '../data/colleges';

interface PinPosition { id: number; x: number; y: number }

// Coordinates derived from the UIUC/Champaign-Urbana street grid.
// Grid reference: Wright St ≈ -88.2272; each block east ≈ +0.0020 lng.
//   Green St ≈ 40.1092; Chalmers ≈ 40.1063; Daniel ≈ 40.1040;
//   Armory ≈ 40.1022; White ≈ 40.0993; Springfield ≈ 40.0970.
//   S 6th St ≈ -88.2305; S 5th ≈ -88.2289; S 3rd ≈ -88.2240; S 1st ≈ -88.2207.
const listingCoords: Record<number, [number, number]> = {
  1:  [-88.2305, 40.1055], // The Dean Campustown     – 708 S 6th St
  2:  [-88.2248, 40.1092], // Bankier 202 Green       – 202 E Green St
  3:  [-88.2228, 40.1092], // HERE Champaign          – 308 E Green St
  4:  [-88.2193, 40.1063], // Illini Tower            – 409 E Chalmers St
  5:  [-88.2207, 40.1010], // Ramshaw at First St     – 1010 S First St
  6:  [-88.2215, 40.1022], // JSM at 308 Armory       – 308 E Armory Ave
  7:  [-88.2173, 40.1091], // JSM at 510 Green        – 510 E Green St
  8:  [-88.2068, 40.0990], // Orchard Downs           – 1841 Orchard Pl, Urbana
  9:  [-88.2170, 40.1091], // Bankier 519 Green       – 519 E Green St
  10: [-88.2214, 40.1063], // UGroup 303 Chalmers     – 303 E Chalmers St
  11: [-88.2195, 40.1063], // JSM Illini Manor        – 401 E Chalmers St
  12: [-88.2263, 40.1063], // MHM at 61 Chalmers      – 61 E Chalmers St
  13: [-88.2226, 40.1092], // 309 Green               – 309 E Green St
  14: [-88.2305, 40.1043], // Hub on Campus           – 812 S 6th St
  15: [-88.2234, 40.1040], // Legacy202               – 202 E Daniel St
  16: [-88.2243, 40.1092], // The Rive Champaign      – 212 E Green St
  17: [-88.2213, 40.1040], // 305 Daniel              – 305 E Daniel St
  18: [-88.2272, 40.1060], // Smile Student Living    – 615 S Wright St
  19: [-88.2340, 40.1025], // Campus Circle           – 1010 W University Ave, Urbana
  20: [-88.2076, 40.1175], // The Linc                – 1601 N Lincoln Ave, Urbana
  21: [-88.2305, 40.1060], // JSM Campus Center       – 601 S 6th St
  22: [-88.2175, 40.1091], // JSM The Summit          – 507 E Green St
  23: [-88.2289, 40.1068], // JSM The Station         – 505 S 5th St
  24: [-88.2305, 40.1068], // The Academy 501         – 501 S 6th St
  25: [-88.2207, 40.1040], // The Academy on First    – 908 S 1st St
  26: [-88.2213, 40.0970], // Burnham 310             – 310 E Springfield Ave
  27: [-88.2213, 40.1077], // Tower at Third          – 302 E John St
  28: [-88.2240, 40.1055], // The Suites at Third     – 707 S 3rd St
  29: [-88.2152, 40.0993], // MHM at 606 White        – 606 E White St
  30: [-88.2076, 40.1210], // Capstone Quarters          – 1901 N Lincoln Ave, Urbana
  31: [-88.2192, 40.1091], // Green & Fourth Flats        – 404 E Green St
  32: [-88.2152, 40.1091], // 601 East Green              – 601 E Green St
  33: [-88.2261, 40.1077], // Lofts 54                    – 54 E John St
  34: [-88.2175, 40.1022], // Sycamore Arms               – 504 E Armory Ave
  35: [-88.2232, 40.1063], // Midtown Chalmers            – 207 E Chalmers St
  36: [-88.2272, 40.1043], // South Wright Suites         – 802 S Wright St
  37: [-88.2252, 40.0993], // White Street Apts           – 102 E White St
  38: [-88.2272, 40.1082], // Wright & Green Corner       – 211 S Wright St
  39: [-88.2252, 40.1063], // The Stratford               – 102 E Chalmers St
  40: [-88.2193, 40.0970], // Springfield Commons         – 405 E Springfield Ave
};

function walkRadiusMeters(mins: number) { return mins * 83; }

// ── Campus district zones — simple grid-aligned rectangles ──
const campusZones: {
  id: string; name: string; nameEn: string; color: string;
  center: [number, number]; coords: [number, number][]
}[] = [
  {
    id: 'eng', name: 'Engineering', nameEn: 'Grainger College', color: '#3b82f6',
    center: [-88.2255, 40.1130],
    coords: [[-88.2300, 40.1092], [-88.2210, 40.1092], [-88.2210, 40.1168], [-88.2300, 40.1168], [-88.2300, 40.1092]],
  },
  {
    id: 'bus', name: 'Business', nameEn: 'Gies College', color: '#16a34a',
    center: [-88.2318, 40.1025],
    coords: [[-88.2370, 40.0985], [-88.2270, 40.0985], [-88.2270, 40.1065], [-88.2370, 40.1065], [-88.2370, 40.0985]],
  },
  {
    id: 'agr', name: 'ACES', nameEn: 'Agricultural Sciences', color: '#f97316',
    center: [-88.2235, 40.1010],
    coords: [[-88.2285, 40.0965], [-88.2185, 40.0965], [-88.2185, 40.1055], [-88.2285, 40.1055], [-88.2285, 40.0965]],
  },
  {
    id: 'las', name: 'LAS', nameEn: 'Liberal Arts & Sciences', color: '#a855f7',
    center: [-88.2278, 40.1075],
    coords: [[-88.2330, 40.1046], [-88.2240, 40.1046], [-88.2240, 40.1105], [-88.2330, 40.1105], [-88.2330, 40.1046]],
  },
  {
    id: 'med', name: 'Media', nameEn: 'College of Media', color: '#ec4899',
    center: [-88.2281, 40.1058],
    coords: [[-88.2310, 40.1042], [-88.2255, 40.1042], [-88.2255, 40.1080], [-88.2310, 40.1080], [-88.2310, 40.1042]],
  },
  {
    id: 'art', name: 'FAA', nameEn: 'Fine & Applied Arts', color: '#0ea5e9',
    center: [-88.2228, 40.1080],
    coords: [[-88.2270, 40.1060], [-88.2195, 40.1060], [-88.2195, 40.1108], [-88.2270, 40.1108], [-88.2270, 40.1060]],
  },
]

function getListingZone(coord: [number, number] | undefined): typeof campusZones[0] | null {
  if (!coord) return null;
  const [lng, lat] = coord;
  for (const z of campusZones) {
    const lngs = z.coords.map(c => c[0]);
    const lats = z.coords.map(c => c[1]);
    if (lng >= Math.min(...lngs) && lng <= Math.max(...lngs) &&
        lat >= Math.min(...lats) && lat <= Math.max(...lats)) return z;
  }
  return null;
}

function makeCircle(center: [number, number], radiusM: number, steps = 64): GeoJSON.Feature {
  const [lng, lat] = center;
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const dx = (radiusM / 111320) * Math.cos(angle);
    const dy = (radiusM / (111320 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
    coords.push([lng + dy, lat + dx]);
  }
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [coords] } };
}

export interface SubleasePin {
  id: number
  type: 'sublease' | 'transfer' | 'roomshare'
  name: string
  address: string
  price: number
  marketRate: number
  via: 'individual' | 'official'
  utilitiesIncluded: boolean
  img: string
  beds: string
  sqft: string
  availableFrom: string   // ISO "2025-05-01"
  availableTo: string     // ISO "2025-08-15"
  badge: string
  badgeColor: string
  listingId: number
  daysUntilLeave: number
  postedBy: string
  furnished: boolean
  leaseEnds?: string
  renewalPossible?: boolean
  totalRooms?: number
}

interface Props {
  selectedCollege: College | null;
  profile: StudentProfile | null;
  onViewListing: (id: number, collegeId?: string | null) => void;
  onReset: () => void;
  mode?: 'rent' | 'sublease';
  subleasePins?: SubleasePin[];
  highlightPinId?: number | null;
  onMessagePoster?: (pin: SubleasePin) => void;
  onViewSubleaseDetail?: (id: number) => void;
  onPinSelect?: (id: number | null) => void;
  filteredIds?: number[];
  savedIds?: Set<number>;
  onToggleSave?: (id: number) => void;
}

export default function Map3DView({ selectedCollege, profile, onViewListing, onReset, mode = 'rent', subleasePins = [], highlightPinId, onMessagePoster, onViewSubleaseDetail, onPinSelect, filteredIds, savedIds: savedIdsProp, onToggleSave }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const buildingMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [is3D, setIs3D] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [, setGuideIdx] = useState(0);

  const [mapTypeFilter, setMapTypeFilter] = useState<'any' | 'studio' | '1br' | '2br+'>('any');
  const [priceSort, setPriceSort] = useState<'default' | 'asc' | 'desc'>('default');
  const savedIds = savedIdsProp ?? new Set<number>();
  const [pinPositions, setPinPositions] = useState<PinPosition[]>([]);
  const pinElemsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  // Extended coords map — includes sublease pin IDs mapped to their building coords
  const coordsForPinsRef = useRef<Record<number, [number, number]>>({ ...listingCoords });
  // Refs kept in sync during render so stable callbacks (map listeners) can read current values
  const modeRef = useRef<'rent' | 'sublease'>(mode);
  const subleasePinsRef = useRef<SubleasePin[]>(subleasePins);
  modeRef.current = mode;
  subleasePinsRef.current = subleasePins;
  const [showZones, setShowZones] = useState(false);
  const showZonesRef = useRef(false);
  showZonesRef.current = showZones;
  const zoneLabelElemsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const activeZoneIdRef = useRef<string | null>(null);
  activeZoneIdRef.current = activeZoneId;
  const [mapZoom, setMapZoom] = useState(15.5);
  const [mapMaxPrice, setMapMaxPrice] = useState<number | null>(null);
  const [walkTimeMins, setWalkTimeMins] = useState<5 | 10 | 15>(10);

  const rankedListings = profile
    ? [...listings].sort((a, b) => matchScore(b, profile) - matchScore(a, profile))
    : listings;

  const scores: Record<number, number> = {};
  if (profile) listings.forEach(l => { scores[l.id] = matchScore(l, profile); });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [-88.2272, 40.1075],
      zoom: 15.5,
      pitch: 55,
      bearing: -20,
    } as maplibregl.MapOptions);

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right');

    const movePinsDirect = () => {
      pinElemsRef.current.forEach((el, id) => {
        const coords = coordsForPinsRef.current[id];
        if (!coords) return;
        const pt = map.project(coords);
        el.style.left = `${pt.x}px`;
        el.style.top = `${pt.y}px`;
      });
      if (showZonesRef.current) {
        zoneLabelElemsRef.current.forEach((el, id) => {
          const zone = campusZones.find(z => z.id === id);
          if (!zone) return;
          const pt = map.project(zone.center as maplibregl.LngLatLike);
          el.style.left = `${pt.x}px`;
          el.style.top = `${pt.y}px`;
        });
      }
    };
    const updatePinState = () => {
      if (modeRef.current === 'sublease') {
        // Recalculate sublease pin positions on resize — use registered coords
        const positions = subleasePinsRef.current.map(s => {
          const coords = coordsForPinsRef.current[s.id];
          if (!coords) return null;
          const pt = map.project(coords);
          return { id: s.id, x: pt.x, y: pt.y };
        }).filter((p): p is PinPosition => p !== null);
        setPinPositions(positions);
      } else {
        const positions = listings.map(l => {
          const coords = listingCoords[l.id];
          if (!coords) return null;
          const pt = map.project(coords);
          return { id: l.id, x: pt.x, y: pt.y };
        }).filter((p): p is PinPosition => p !== null);
        setPinPositions(positions);
      }
    };
    map.on('move', movePinsDirect);
    map.on('resize', updatePinState);

    map.on('load', () => {
      setMapLoaded(true);
      updatePinState();
      map.addSource('walk-radius', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({ id: 'walk-radius-fill', type: 'fill', source: 'walk-radius', paint: { 'fill-color': '#4f46e5', 'fill-opacity': 0.07 } });
      map.addLayer({ id: 'walk-radius-line', type: 'line', source: 'walk-radius', paint: { 'line-color': '#4f46e5', 'line-width': 2, 'line-dasharray': [4, 3], 'line-opacity': 0.5 } });

      // Campus district zone polygons
      map.addSource('campus-zones', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: campusZones.map(z => ({
            type: 'Feature' as const,
            properties: { color: z.color, zoneId: z.id },
            geometry: { type: 'Polygon' as const, coordinates: [z.coords] },
          })),
        },
      });
      // Glow halo — wide blurred line underneath for premium feel
      map.addLayer({
        id: 'campus-zones-glow', type: 'line', source: 'campus-zones',
        layout: { visibility: 'none' },
        paint: {
          'line-color': ['get', 'color'] as unknown as string,
          'line-width': 14,
          'line-opacity': 0.20,
          'line-blur': 10,
        },
      });
      map.addLayer({
        id: 'campus-zones-fill', type: 'fill', source: 'campus-zones',
        layout: { visibility: 'none' },
        paint: { 'fill-color': ['get', 'color'] as unknown as string, 'fill-opacity': 0.13 },
      });
      map.addLayer({
        id: 'campus-zones-line', type: 'line', source: 'campus-zones',
        layout: { visibility: 'none' },
        paint: {
          'line-color': ['get', 'color'] as unknown as string,
          'line-width': 2,
          'line-opacity': 0.90,
          'line-blur': 0.4,
        },
      });

      // Click fill area to activate zone
      map.on('click', 'campus-zones-fill', (e) => {
        if (!showZonesRef.current) return;
        const zoneId = e.features?.[0]?.properties?.zoneId as string | undefined;
        if (!zoneId) return;
        const zone = campusZones.find(z => z.id === zoneId);
        if (!zone) return;
        const next = activeZoneIdRef.current === zoneId ? null : zoneId;
        setActiveZoneId(next);
        if (next) {
          map.flyTo({ center: zone.center, zoom: 15.8, pitch: 52, bearing: -20, duration: 700, essential: true });
        } else {
          map.flyTo({ center: [-88.2272, 40.1075] as [number, number], zoom: 15.5, pitch: 55, bearing: -20, duration: 700, essential: true });
        }
      });
      map.on('mouseenter', 'campus-zones-fill', () => { if (showZonesRef.current) map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'campus-zones-fill', () => { map.getCanvas().style.cursor = ''; });
      map.on('zoomend', () => { setMapZoom(map.getZoom()); updatePinState(); });
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    const college = profile?.college ?? selectedCollege;

    const src = map.getSource('walk-radius') as maplibregl.GeoJSONSource | undefined;
    if (src) {
      if (college) {
        src.setData(makeCircle(college.coords, walkRadiusMeters(walkTimeMins)));
      } else {
        src.setData({ type: 'FeatureCollection', features: [] });
      }
    }

    buildingMarkerRef.current?.remove();
    if (college) {
      const el = document.createElement('div');
      el.style.cssText = `display:flex;flex-direction:column;align-items:center;pointer-events:none;`;
      el.innerHTML = `
        <div style="background:#4f46e5;color:white;font-size:11px;font-weight:800;padding:5px 10px;border-radius:20px;white-space:nowrap;box-shadow:0 4px 16px rgba(79,70,229,0.4);display:flex;align-items:center;gap:5px;">
          <span style="font-size:14px">${college.emoji}</span>
          ${college.short} · 10 min walk
        </div>
        <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid #4f46e5;margin-top:-1px;"></div>
        <div style="width:10px;height:10px;background:#4f46e5;border-radius:50%;border:2px solid white;box-shadow:0 0 0 3px rgba(79,70,229,0.3);margin-top:2px;"></div>
      `;
      buildingMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(college.coords)
        .addTo(map);
    }
  }, [mapLoaded, profile, selectedCollege, walkTimeMins]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !profile) return;
    const best = rankedListings[0];
    const coords = best ? listingCoords[best.id] : null;
    if (!coords) return;
    const college = profile.college;

    setTimeout(() => {
      mapRef.current?.flyTo({ center: coords, zoom: 15.5, pitch: 58, bearing: -15, duration: 1400, essential: true });
      if (college) {
        setTimeout(() => {
          mapRef.current?.easeTo({ center: college.coords, zoom: 15.2, pitch: 55, duration: 800 });
          setTimeout(() => {
            mapRef.current?.flyTo({ center: coords, zoom: 16, pitch: 62, duration: 900, essential: true });
          }, 1100);
        }, 1800);
      }
    }, 300);
  }, [profile, mapLoaded]);

  // Toggle campus district zones
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    const vis = showZones ? 'visible' : 'none';
    if (map.getLayer('campus-zones-glow')) map.setLayoutProperty('campus-zones-glow', 'visibility', vis);
    if (map.getLayer('campus-zones-fill')) map.setLayoutProperty('campus-zones-fill', 'visibility', vis);
    if (map.getLayer('campus-zones-line')) map.setLayoutProperty('campus-zones-line', 'visibility', vis);
    // Position zone label DOM elements when zones become visible
    if (showZones) {
      campusZones.forEach(zone => {
        const el = zoneLabelElemsRef.current.get(zone.id);
        if (!el) return;
        const pt = map.project(zone.center as maplibregl.LngLatLike);
        el.style.left = `${pt.x}px`;
        el.style.top = `${pt.y}px`;
      });
    }
  }, [showZones, mapLoaded]);

  // Dim non-active zones using data-driven paint expressions
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !showZones) return;
    const map = mapRef.current;
    if (activeZoneId) {
      const fillExpr = ['case', ['==', ['get', 'zoneId'], activeZoneId], 0.18, 0.04] as unknown as number;
      const lineExpr = ['case', ['==', ['get', 'zoneId'], activeZoneId], 0.90, 0.12] as unknown as number;
      const glowExpr = ['case', ['==', ['get', 'zoneId'], activeZoneId], 0.22, 0.04] as unknown as number;
      if (map.getLayer('campus-zones-fill')) map.setPaintProperty('campus-zones-fill', 'fill-opacity', fillExpr);
      if (map.getLayer('campus-zones-line')) map.setPaintProperty('campus-zones-line', 'line-opacity', lineExpr);
      if (map.getLayer('campus-zones-glow')) map.setPaintProperty('campus-zones-glow', 'line-opacity', glowExpr);
    } else {
      if (map.getLayer('campus-zones-fill')) map.setPaintProperty('campus-zones-fill', 'fill-opacity', 0.13);
      if (map.getLayer('campus-zones-line')) map.setPaintProperty('campus-zones-line', 'line-opacity', 0.90);
      if (map.getLayer('campus-zones-glow')) map.setPaintProperty('campus-zones-glow', 'line-opacity', 0.20);
    }
  }, [activeZoneId, showZones, mapLoaded]);

  // Recompute pins when mode or subleasePins change
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    pinElemsRef.current.clear();

    if (mode === 'sublease') {
      // Register sublease coords
      subleasePins.forEach(s => {
        const base = listingCoords[s.listingId];
        if (base) coordsForPinsRef.current[s.id] = base;
      });
      const positions = subleasePins.map(s => {
        const coords = coordsForPinsRef.current[s.id];
        if (!coords) return null;
        const pt = map.project(coords);
        return { id: s.id, x: pt.x, y: pt.y };
      }).filter((p): p is PinPosition => p !== null);
      setPinPositions(positions);
    } else {
      const positions = listings.map(l => {
        const coords = listingCoords[l.id];
        if (!coords) return null;
        const pt = map.project(coords);
        return { id: l.id, x: pt.x, y: pt.y };
      }).filter((p): p is PinPosition => p !== null);
      setPinPositions(positions);
    }
    setSelectedId(null);
  }, [mode, subleasePins, mapLoaded]);

  // Fly to + select a pin when triggered from outside (e.g. left-panel card click)
  useEffect(() => {
    if (highlightPinId == null || !mapLoaded) return;
    const t = setTimeout(() => {
      if (!mapRef.current) return;
      const coords = coordsForPinsRef.current[highlightPinId];
      if (coords) {
        mapRef.current.flyTo({ center: coords, zoom: 16.5, pitch: 62, bearing: mapRef.current.getBearing(), duration: 700, essential: true });
        setSelectedId(highlightPinId);
      }
    }, 100);
    return () => clearTimeout(t);
  }, [highlightPinId, mapLoaded]);

  const toggle3D = () => {
    if (!mapRef.current) return;
    if (is3D) mapRef.current.easeTo({ pitch: 0, bearing: 0, duration: 700 });
    else mapRef.current.easeTo({ pitch: 55, bearing: -20, duration: 700 });
    setIs3D(v => !v);
  };

  const flyTo = useCallback((id: number) => {
    const coords = listingCoords[id];
    if (!coords || !mapRef.current) return;
    mapRef.current.flyTo({ center: coords, zoom: 17, pitch: 65, bearing: 30, duration: 900, essential: true });
  }, []);

  const typeFilteredListings = listings.filter(l => {
    if (filteredIds && !filteredIds.includes(l.id)) return false;
    if (activeZoneId && getListingZone(listingCoords[l.id])?.id !== activeZoneId) return false;
    if (mapMaxPrice !== null && l.price > mapMaxPrice) return false;
    if (mapTypeFilter === 'studio') return l.beds.toLowerCase().includes('studio')
    if (mapTypeFilter === '1br') return l.beds.startsWith('1B')
    if (mapTypeFilter === '2br+') return !l.beds.toLowerCase().includes('studio') && !l.beds.startsWith('1B')
    return true
  });
  const sortedCards = (() => {
    const base = profile
      ? rankedListings.filter(l => typeFilteredListings.some(t => t.id === l.id))
      : typeFilteredListings;
    if (priceSort === 'asc') return [...base].sort((a, b) => a.price - b.price);
    if (priceSort === 'desc') return [...base].sort((a, b) => b.price - a.price);
    return base;
  })();
  const allCards = sortedCards;
  const renderBottomStrip = () => (
    <div className="absolute bottom-0 right-0 pb-3" style={{ zIndex: 15, left: 20 }}>
      {/* Sort + Reset row */}
      <div className="flex items-center justify-between pr-5 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-[#1c1c1e]">{allCards.length}</span>
          <span className="text-[10px] text-[#1c1c1e] font-medium">listing{allCards.length !== 1 ? 's' : ''} · Sort:</span>
          {(['default', 'asc', 'desc'] as const).map(s => (
            <button key={s} onClick={() => setPriceSort(s)}
              className={`h-6 px-2 rounded-lg text-[10px] font-semibold transition-all ${priceSort === s ? 'bg-[#1c1c1e] text-white' : 'bg-white/80 text-[#6c6a66] border border-[#e8e7e3] hover:border-[#1c1c1e]'}`}>
              {s === 'default' ? 'Best match' : s === 'asc' ? '$ Low→High' : '$ High→Low'}
            </button>
          ))}
        </div>
        {profile && (
          <button onClick={() => { setSelectedId(null); onReset(); setPriceSort('default'); }} className="h-6 px-2.5 rounded-lg bg-red-50 text-red-500 text-[10px] font-semibold">Reset</button>
        )}
      </div>
      {/* Horizontally scrollable card strip */}
      <div
        key={`strip-${activeZoneId ?? 'all'}-${mapMaxPrice ?? 'any'}`}
        className="flex gap-3 overflow-x-auto"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`.map-strip::-webkit-scrollbar { display: none }`}</style>
        {allCards.map((l, i) => {
          const s = profile ? scores[l.id] : 0;
          const isActive = selectedId === l.id;
          const walkMins = activeCollege ? l.walkFrom[activeCollege.id] : null;
          return (
            <button key={l.id}
              onClick={() => { setSelectedId(l.id); flyTo(l.id); setGuideIdx(i); onPinSelect?.(l.id); }}
              style={{ scrollSnapAlign: 'start', flexShrink: 0, animation: 'cardIn 0.25s ease both', animationDelay: `${i * 25}ms` }}
              className={`flex w-[260px] rounded-2xl overflow-hidden transition-all h-[136px] bg-white text-left ${isActive ? 'ring-2 ring-[#1c1c1e] shadow-xl' : 'shadow-lg hover:shadow-xl'}`}
            >
              <div className="relative w-[110px] flex-shrink-0 h-full">
                <img src={l.img} className="w-full h-full object-cover" />
                {profile && i === 0 && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-[9px] font-black px-2 py-1 rounded-full leading-none">★ #1</div>
                )}
              </div>
              <div className="flex flex-col justify-between px-3 py-3 flex-1 min-w-0">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#1c1c1e] leading-tight truncate">{l.name}</p>
                      <p className="text-[11px] text-[#9ca3af] leading-tight truncate">{l.address}</p>
                    </div>
                    <div role="button" className="flex-shrink-0 w-7 h-7 rounded-full bg-[#f5f4f0] flex items-center justify-center mt-0.5 cursor-pointer" onClick={e => { e.stopPropagation(); onToggleSave?.(l.id); }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill={savedIds.has(l.id) ? '#ef4444' : 'none'} stroke={savedIds.has(l.id) ? '#ef4444' : '#6c6a66'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </div>
                  </div>
                  <p className="text-[15px] font-black text-[#1c1c1e] leading-tight mt-1.5">${l.price}<span className="text-[11px] font-normal text-[#9ca3af]">/month</span></p>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="flex items-center gap-1 text-[10px] text-[#6c6a66]">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    {l.beds}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-[#6c6a66]">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                    {l.sqft}
                  </span>
                  {walkMins != null && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-500">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {walkMins}m
                    </span>
                  )}
                  {s > 0 && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s >= 80 ? 'bg-green-100 text-green-700' : s >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{s}%</span>}
                  {!profile && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto ${l.badgeColor}`}>{l.badge}</span>}
                </div>
              </div>
            </button>
          );
        })}
        {/* trailing spacer so last card doesn't hug the edge */}
        <div style={{ flexShrink: 0, width: 4 }} />
      </div>
    </div>
  );

  const selectedListing = listings.find(l => l.id === selectedId) ?? null;
  const selectedScore = selectedListing && profile ? scores[selectedListing.id] : 0;
  const selectedReasons = selectedListing && profile ? matchReasons(selectedListing, profile) : [];
  const activeCollege = profile?.college ?? selectedCollege;

  return (
    <div className="relative flex-1 overflow-hidden flex flex-col select-none">
      <style>{`@keyframes cardIn { from { opacity:0;transform:translateY(-8px) scale(0.97); } to { opacity:1;transform:translateY(0) scale(1); } } @keyframes urgentPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.6); } 50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); } } .maplibregl-ctrl-top-right { margin-top: 128px !important; }`}</style>

      <div ref={containerRef} className="flex-1" />

      {/* Map top toolbar — FindPlace style */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-col gap-2">
        {/* Search bar + 3D toggle row */}
        <div className="flex items-center gap-2">
          <div className="bg-white rounded-2xl shadow-lg border border-black/6 flex items-center px-4 h-12 gap-3 flex-1 min-w-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[9px] text-[#9ca3af] font-semibold uppercase tracking-wider leading-none">Region</span>
              <span className="text-[13px] font-semibold text-[#1c1c1e] leading-tight">UIUC area, Champaign IL</span>
            </div>
            <button className="w-8 h-8 rounded-full bg-[#1c1c1e] flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
            </button>
          </div>
          {/* 3D / 2D toggle */}
          <button onClick={toggle3D}
            className="h-12 px-3.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-black/8 text-[12px] font-bold text-[#1c1c1e] flex items-center gap-1.5 flex-shrink-0">
            {is3D ? '🏙️ 3D' : '🗺️ 2D'}
          </button>
          {/* District zones toggle */}
          <button onClick={() => setShowZones(v => !v)}
            className={`h-12 px-3.5 rounded-2xl shadow-lg border text-[12px] font-bold flex items-center gap-1.5 flex-shrink-0 transition-all ${
              showZones
                ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]'
                : 'bg-white/95 backdrop-blur-md text-[#1c1c1e] border-black/8'
            }`}
            title="Show campus districts"
          >
            🏫 Districts
          </button>
        </div>

        {/* Zone legend chips — visible when Districts is on */}
        {showZones && (
          <div className="flex gap-1.5 flex-wrap">
            {campusZones.map(zone => {
              const count = listings.filter(l => getListingZone(listingCoords[l.id])?.id === zone.id).length;
              const isActive = activeZoneId === zone.id;
              return (
                <button key={zone.id}
                  onClick={() => {
                    const next = isActive ? null : zone.id;
                    setActiveZoneId(next);
                    if (next && mapRef.current) {
                      mapRef.current.flyTo({ center: zone.center, zoom: 15.8, pitch: 52, bearing: -20, duration: 700, essential: true });
                    } else if (!next && mapRef.current) {
                      mapRef.current.flyTo({ center: [-88.2272, 40.1075], zoom: 15.5, pitch: 55, bearing: -20, duration: 700, essential: true });
                    }
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold shadow-md border transition-all"
                  style={isActive
                    ? { background: zone.color, borderColor: zone.color, color: 'white' }
                    : { background: 'white', borderColor: '#e8e7e3', color: '#1c1c1e' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: isActive ? 'rgba(255,255,255,0.7)' : zone.color, flexShrink: 0 }} />
                  <span>{zone.name}</span>
                  <span style={{ opacity: isActive ? 0.75 : undefined }} className={isActive ? '' : 'text-[#9ca3af] font-semibold'}>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Type icon buttons — hidden in sublease mode */}
        <div className={`flex gap-2 ${mode === 'sublease' ? 'hidden' : ''}`}>
          {([
            { id: 'any' as const, label: 'Any', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> },
            { id: 'studio' as const, label: 'Studio', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h6M3 15h6M15 3v18M15 9h6M15 15h6"/></svg> },
            { id: '1br' as const, label: '1BR', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
            { id: '2br+' as const, label: '2BR+', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h20v16H2z"/><path d="M12 4v16"/></svg> },
          ] as const).map(t => (
            <button key={t.id}
              onClick={() => { setMapTypeFilter(t.id); }}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md border transition-all ${
                mapTypeFilter === t.id ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]' : 'bg-white text-[#6c6a66] border-black/6 hover:text-[#1c1c1e]'
              }`}
              title={t.label}
            >
              {t.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Zone label DOM overlays — positioned via map.project, updated on every map move */}
      {showZones && campusZones.map(zone => {
        const count = listings.filter(l => getListingZone(listingCoords[l.id])?.id === zone.id).length;
        return (
          <div
            key={zone.id}
            ref={el => { if (el) zoneLabelElemsRef.current.set(zone.id, el); else zoneLabelElemsRef.current.delete(zone.id); }}
            onClick={() => {
              const next = activeZoneId === zone.id ? null : zone.id;
              setActiveZoneId(next);
              if (next && mapRef.current) {
                mapRef.current.flyTo({ center: zone.center, zoom: 15.8, pitch: 52, bearing: -20, duration: 700, essential: true });
              } else if (!next && mapRef.current) {
                mapRef.current.flyTo({ center: [-88.2272, 40.1075], zoom: 15.5, pitch: 55, bearing: -20, duration: 700, essential: true });
              }
            }}
            style={{
              position: 'absolute', left: 0, top: 0,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto', zIndex: 4, cursor: 'pointer',
            }}
          >
            {mapZoom < 14.5 ? (
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: zone.color,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 14px ${zone.color}55`,
                border: '2px solid white',
                transition: 'all 0.2s ease',
              }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: 'white', lineHeight: 1 }}>{count}</span>
                <span style={{ fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1.2, textAlign: 'center', maxWidth: 40, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{zone.name}</span>
              </div>
            ) : (
              <div style={{
                background: activeZoneId === zone.id ? zone.color : 'white',
                border: `1px solid ${activeZoneId === zone.id ? zone.color : '#e8e7e3'}`,
                borderRadius: 22,
                padding: '5px 12px 5px 9px',
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: activeZoneId === zone.id ? `0 4px 14px ${zone.color}55` : '0 2px 10px rgba(0,0,0,0.12)',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: activeZoneId === zone.id ? 'rgba(255,255,255,0.7)' : zone.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: activeZoneId === zone.id ? 'white' : '#1c1c1e', letterSpacing: '-0.1px' }}>{zone.name}</span>
                {count > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 600, color: activeZoneId === zone.id ? 'rgba(255,255,255,0.7)' : '#9ca3af', marginLeft: 1 }}>{count}</span>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Pin overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
        {mode === 'sublease' ? (
          /* ── Sublease pins — discount + urgency colour ── */
          pinPositions.map(pos => {
            const s = subleasePins.find(p => p.id === pos.id);
            if (!s) return null;
            const isSelected = selectedId === s.id;
            const discount = Math.round((1 - s.price / s.marketRate) * 100);
            const urgColor = s.daysUntilLeave <= 7 ? '#ef4444' : s.daysUntilLeave <= 21 ? '#f97316' : '#6b7280';
            const typeLabel = s.type === 'sublease' ? 'Sublet' : s.type === 'transfer' ? 'Transfer' : 'Room';
            return (
              <div
                key={s.id}
                ref={el => { if (el) pinElemsRef.current.set(s.id, el); else pinElemsRef.current.delete(s.id); }}
                onClick={() => {
                  const next = selectedId === s.id ? null : s.id;
                  setSelectedId(next);
                  onPinSelect?.(next);
                  const coords = coordsForPinsRef.current[s.id];
                  if (coords && mapRef.current) {
                    mapRef.current.flyTo({ center: coords, zoom: 16.5, pitch: 62, bearing: mapRef.current.getBearing(), duration: 700, essential: true });
                  }
                }}
                style={{
                  position: 'absolute', left: pos.x, top: pos.y,
                  transform: `translate(-50%, -100%) ${isSelected ? 'scale(1.12)' : 'scale(1)'}`,
                  zIndex: isSelected ? 20 : 10, cursor: 'pointer', pointerEvents: 'auto',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.2s ease',
                }}
              >
                {s.daysUntilLeave <= 7 && !isSelected && (
                  <span style={{ fontSize: 9, background: '#ef4444', color: 'white', fontWeight: 800, padding: '2px 7px', borderRadius: 20, marginBottom: 4, whiteSpace: 'nowrap' }}>
                    🔴 {s.daysUntilLeave}d
                  </span>
                )}
                <div style={{
                  background: isSelected ? '#1c1c1e' : 'rgba(255,255,255,0.97)',
                  borderRadius: 24, padding: '5px 11px',
                  display: 'flex', alignItems: 'center', gap: 4,
                  boxShadow: isSelected ? '0 6px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.14)',
                  border: isSelected ? 'none' : `2px solid ${urgColor}`,
                  whiteSpace: 'nowrap',
                }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: isSelected ? 'rgba(255,255,255,0.65)' : urgColor }}>-{discount}%</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: isSelected ? 'white' : '#1c1c1e' }}>${s.price}</span>
                  <span style={{ fontSize: 9, color: isSelected ? 'rgba(255,255,255,0.45)' : '#9ca3af' }}>{typeLabel}</span>
                </div>
                <div style={{ width: 2, height: 8, background: isSelected ? '#1c1c1e' : urgColor, marginTop: -1 }} />
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: isSelected ? '#1c1c1e' : urgColor, border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.25)', marginTop: -1, animation: s.daysUntilLeave <= 7 && !isSelected ? 'urgentPulse 1.4s ease-in-out infinite' : undefined }} />
              </div>
            );
          })
        ) : (
          /* ── Rent pins (default) ── */
          pinPositions.map(pos => {
            const listing = listings.find(l => l.id === pos.id);
            if (!listing) return null;
            const inZone = !activeZoneId || getListingZone(listingCoords[listing.id])?.id === activeZoneId;
            if (mapZoom < 14.5) return null;
            if (filteredIds && !filteredIds.includes(listing.id)) return null;
            const isSelected = selectedId === listing.id;
            const score = profile ? scores[listing.id] : 0;
            const hasProfile = !!profile;
            const isBestMatch = hasProfile && rankedListings[0]?.id === listing.id;
            const dotColor = !hasProfile ? '#9ca3af' : score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#9ca3af';
            const zone = showZones ? getListingZone(listingCoords[listing.id]) : null;
            const zoneColor = zone?.color;
            return (
              <div
                key={listing.id}
                ref={el => { if (el) pinElemsRef.current.set(listing.id, el); else pinElemsRef.current.delete(listing.id); }}
                onClick={() => {
                  const next = selectedId === listing.id ? null : listing.id;
                  setSelectedId(next);
                  onPinSelect?.(next);
                  const coords = listingCoords[listing.id];
                  if (coords && mapRef.current) {
                    mapRef.current.flyTo({ center: coords, zoom: 16.5, pitch: 62, bearing: mapRef.current.getBearing(), duration: 700, essential: true });
                  }
                }}
                style={{
                  position: 'absolute', left: pos.x, top: pos.y,
                  transform: `translate(-50%, -100%) ${isSelected ? 'scale(1.12)' : 'scale(1)'}`,
                  zIndex: isSelected ? 20 : 10, cursor: 'pointer', pointerEvents: 'auto',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.2s ease, opacity 0.2s ease',
                  opacity: inZone ? 1 : 0.25,
                }}
              >
                {isBestMatch && !isSelected && (
                  <span style={{ fontSize: 9, background: '#22c55e', color: 'white', fontWeight: 800, padding: '2px 7px', borderRadius: 20, marginBottom: 4, whiteSpace: 'nowrap', display: 'block' }}>★ Best match</span>
                )}
                <div style={{ position: 'relative' }}>
                <div style={{
                  background: isSelected ? (zoneColor ?? '#1c1c1e') : 'rgba(255,255,255,0.97)',
                  color: isSelected ? 'white' : (zoneColor ?? '#1c1c1e'),
                  borderRadius: 24, padding: '6px 13px',
                  display: 'flex', alignItems: 'center', gap: 5,
                  boxShadow: isSelected
                    ? `0 6px 24px ${zoneColor ? zoneColor + '66' : 'rgba(0,0,0,0.3)'}`
                    : `0 2px 12px rgba(0,0,0,0.14)`,
                  border: isSelected ? 'none' : `2px solid ${zoneColor ?? 'rgba(0,0,0,0.08)'}`,
                  fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap',
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isSelected ? 'white' : (zoneColor ?? '#1c1c1e')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span>${listing.price}/mo</span>
                </div>
                {savedIds.has(listing.id) && (
                  <div style={{ position: 'absolute', top: -5, right: -5, width: 15, height: 15, borderRadius: '50%', background: '#ef4444', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7 }}>❤</div>
                )}
                </div>
                <div style={{ width: 2, height: 8, background: isSelected ? (zoneColor ?? '#1c1c1e') : (zoneColor ?? 'rgba(0,0,0,0.2)'), marginTop: -1 }} />
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: isSelected ? (zoneColor ?? '#1c1c1e') : (zoneColor ?? dotColor), border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.25)', marginTop: -1 }} />
              </div>
            );
          })
        )}
      </div>

      {/* Floating detail card — FindPlace dark style */}
      {selectedListing && (
        <div style={{
          position: 'absolute',
          top: 130,
          left: 16,
          width: 300,
          background: '#181818',
          borderRadius: 24,
          boxShadow: '0 16px 60px rgba(0,0,0,0.45)',
          overflow: 'hidden',
          zIndex: 30,
          animation: 'cardIn 0.22s ease',
        }}>
          {/* Photo */}
          <div style={{ position: 'relative', height: 168 }}>
            <img src={selectedListing.img} alt={selectedListing.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,20,20,0.85) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />

            {/* Top badges */}
            <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
              {profile && (
                <span style={{ fontSize: 11, fontWeight: 800, padding: '5px 10px', borderRadius: 20, background: selectedScore >= 80 ? '#22c55e' : selectedScore >= 60 ? '#f59e0b' : '#6b7280', color: 'white', display: 'flex', alignItems: 'center', gap: 4 }}>
                  ★ {selectedScore}%
                </span>
              )}
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${selectedListing.badgeColor}`}>{selectedListing.badge}</span>
            </div>

            {/* Close + 3D buttons */}
            <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
              <button
                onClick={() => flyTo(selectedListing.id)}
                style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
              >🏙️</button>
              <button
                onClick={() => setSelectedId(null)}
                style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 300, lineHeight: 1 }}
              >×</button>
            </div>
          </div>

          {/* Dark content body */}
          <div style={{ padding: '14px 16px 16px' }}>
            <p style={{ fontWeight: 800, fontSize: 17, color: 'white', lineHeight: 1.2, marginBottom: 4 }}>{selectedListing.name}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>{selectedListing.address}</p>

            <p style={{ fontSize: 20, fontWeight: 900, color: 'white', letterSpacing: '-0.5px', marginBottom: 12 }}>
              ${selectedListing.price}<span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.45)' }}>/month</span>
            </p>

            {/* Specs row — icon style */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                {selectedListing.beds}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>
                {selectedListing.sqft}
              </span>
              {activeCollege && (
                <span style={{ fontSize: 11, color: '#818cf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {selectedListing.walkFrom[activeCollege.id]}m walk
                </span>
              )}
            </div>

            {/* Match reasons */}
            {profile && selectedReasons.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                {selectedReasons.slice(0, 3).map((r, i) => (
                  <span key={i} style={{ fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 20, background: r.ok ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: r.ok ? '#4ade80' : '#f87171' }}>
                    {r.ok ? '✓' : '✗'} {r.text}
                  </span>
                ))}
              </div>
            )}

            {/* Description snippet */}
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: 14 }}>
              {selectedListing.amenities.slice(0, 3).join(' · ')} · and more amenities included.{' '}
              <span style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>see details</span>
            </p>

            {/* CTA */}
            <button
              onClick={() => onViewListing(selectedListing.id, profile?.college?.id ?? selectedCollege?.id)}
              style={{ width: '100%', height: 42, background: 'white', color: '#1c1c1e', borderRadius: 14, border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer', letterSpacing: '-0.2px' }}
            >
              View details →
            </button>
          </div>
        </div>
      )}


      {/* Sublease floating detail card */}
      {mode === 'sublease' && (() => {
        const s = subleasePins.find(p => p.id === selectedId);
        if (!s) return null;
        const discount = Math.round((1 - s.price / s.marketRate) * 100);
        const urgColor = s.daysUntilLeave <= 7 ? '#ef4444' : s.daysUntilLeave <= 21 ? '#f97316' : '#6b7280';
        const typeLabel = s.type === 'sublease' ? '🔄 Sublet' : s.type === 'transfer' ? '📋 Transfer' : '🏠 Room Share';
        const fmtD = (d: string) => { const [,m,day] = d.split('-'); return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1] + ' ' + +day; };
        return (
          <div style={{
            position: 'absolute', top: 130, left: 16, width: 300,
            background: '#181818', borderRadius: 24,
            boxShadow: '0 16px 60px rgba(0,0,0,0.45)',
            overflow: 'hidden', zIndex: 30, animation: 'cardIn 0.22s ease',
          }}>
            {/* Photo */}
            <div style={{ position: 'relative', height: 148 }}>
              <img src={s.img} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,20,20,0.9) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />
              {/* Type + urgency badges */}
              <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 5, alignItems: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                  {typeLabel}
                </span>
                {s.daysUntilLeave <= 21 && (
                  <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 20, background: urgColor, color: 'white' }}>{s.daysUntilLeave}d left</span>
                )}
              </div>
              {/* Close */}
              <button onClick={() => setSelectedId(null)}
                style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 300, lineHeight: 1 }}>×</button>
              {/* Price + savings bottom */}
              <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: 'white' }}>${s.price}<span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>/mo</span></span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>${s.marketRate}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#4ade80' }}>-{discount}%</span>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '11px 14px 14px' }}>
              <p style={{ fontWeight: 800, fontSize: 14, color: 'white', lineHeight: 1.2, marginBottom: 2 }}>{s.name}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>{s.address}</p>

              {/* Date range */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, padding: '7px 11px', background: 'rgba(255,255,255,0.06)', borderRadius: 10 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{fmtD(s.availableFrom)} → {fmtD(s.availableTo)}</span>
              </div>

              {/* Specs row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{s.beds}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{s.sqft}</span>
                {s.furnished && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>Furnished</span>}
                {s.utilitiesIncluded && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(74,222,128,0.12)', color: '#4ade80' }}>Utils incl.</span>}
              </div>

              {/* Poster */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '8px 11px', background: 'rgba(255,255,255,0.05)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                  {s.postedBy[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'white', marginBottom: 1 }}>{s.postedBy}</p>
                  <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>UIUC student · {s.via === 'individual' ? 'Individual' : 'Official platform'}</p>
                </div>
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <button
                  onClick={() => onMessagePoster?.(s)}
                  style={{ flex: 1, height: 42, background: 'white', color: '#1c1c1e', borderRadius: 14, border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
                >
                  Message {s.postedBy.split(' ')[0]} →
                </button>
                <button style={{ width: 42, height: 42, background: 'rgba(255,255,255,0.08)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <button
                onClick={() => onViewSubleaseDetail?.(s.id)}
                style={{ width: '100%', height: 36, background: 'transparent', color: 'rgba(255,255,255,0.5)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: 0 }}
              >
                See full details
              </button>
            </div>
          </div>
        );
      })()}

      {/* Budget quick slider */}
      {mode !== 'sublease' && (
        <div className="absolute left-3 pointer-events-auto" style={{ zIndex: 10, bottom: activeCollege ? 234 : 190 }}>
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-black/8 px-3 py-2.5" style={{ width: 156 }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-semibold text-[#9ca3af] uppercase tracking-wider">Budget</span>
              <span className="text-[11px] font-bold text-[#1c1c1e]">{mapMaxPrice ? `≤ $${mapMaxPrice}` : 'Any'}</span>
            </div>
            <input type="range" min={600} max={1400} step={50}
              value={mapMaxPrice ?? 1400}
              onChange={e => setMapMaxPrice(+e.target.value === 1400 ? null : +e.target.value)}
              className="w-full cursor-pointer" style={{ accentColor: '#1c1c1e', height: 4 }} />
            <div className="flex justify-between mt-1">
              <span className="text-[8px] text-[#c0bfbb]">$600</span>
              <span className="text-[8px] text-[#c0bfbb]">Any</span>
            </div>
          </div>
        </div>
      )}

      {/* Walk radius legend + time toggle */}
      {activeCollege && (
        <div className="absolute bottom-[190px] left-3 pointer-events-auto" style={{ zIndex: 10 }}>
          <div className="bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-xl shadow-md border border-black/8 flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-indigo-500 bg-indigo-50 flex-shrink-0" />
            {([5, 10, 15] as const).map(m => (
              <button key={m} onClick={() => setWalkTimeMins(m)}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md transition-all ${walkTimeMins === m ? 'bg-indigo-500 text-white' : 'text-[#6c6a66] hover:text-indigo-500'}`}>
                {m}m
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom card strip */}
      {mode === 'sublease' ? (
        /* ── Sublease horizontal strip ── */
        subleasePins.length > 0 && (
          <div className="absolute bottom-0 right-0 pb-3" style={{ zIndex: 15, left: 20 }}>
            <div className="flex justify-end items-center px-6 pt-2 pb-5 gap-1.5">
              <span className="text-[11px] font-semibold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                {subleasePins.length} sublease{subleasePins.length > 1 ? 's' : ''} available
              </span>
            </div>
            <div className="flex items-stretch gap-0" style={{ scrollSnapType: 'x mandatory', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {subleasePins.map(s => {
                const isActive = selectedId === s.id
                const disc = Math.round((1 - s.price / s.marketRate) * 100)
                const urgColor = s.daysUntilLeave <= 7 ? 'bg-red-500' : s.daysUntilLeave <= 21 ? 'bg-orange-400' : ''
                const typeLabel = s.type === 'sublease' ? '🔄 Sublet' : s.type === 'transfer' ? '📋 Transfer' : '🏠 Room Share'
                const fmtD = (d: string) => { const [,m,day] = d.split('-'); return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1]+' '+d.split('-')[2].replace(/^0/,''); }
                return (
                  <button key={s.id}
                    onClick={() => {
                      setSelectedId(s.id)
                      const coords = coordsForPinsRef.current[s.id]
                      if (coords && mapRef.current) mapRef.current.flyTo({ center: coords, zoom: 16.5, pitch: 62, bearing: mapRef.current.getBearing(), duration: 700, essential: true })
                    }}
                    className={`flex flex-shrink-0 w-[270px] rounded-2xl overflow-hidden transition-all h-[130px] mx-2 bg-white text-left ${isActive ? 'ring-2 ring-[#1c1c1e] shadow-xl' : 'shadow-lg hover:shadow-xl'}`}
                  >
                    <div className="relative w-[95px] flex-shrink-0 h-full">
                      <img src={s.img} className="w-full h-full object-cover" />
                      {/* urgency badge */}
                      {s.daysUntilLeave <= 21 && urgColor && (
                        <div className={`absolute top-1.5 left-1.5 ${urgColor} text-white text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none`}>{s.daysUntilLeave}d</div>
                      )}
                    </div>
                    <div className="flex flex-col justify-between px-2.5 py-2.5 flex-1 min-w-0">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-[12px] font-bold text-[#1c1c1e] leading-tight truncate flex-1">{s.name}</p>
                        <span className="flex-shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-[#f5f4f0] text-[#6c6a66] ml-1">{typeLabel}</span>
                      </div>
                      {/* Price + savings */}
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-[14px] font-black text-[#1c1c1e]">${s.price}<span className="text-[10px] font-normal text-[#9ca3af]">/mo</span></span>
                        <span className="text-[10px] text-[#c0bfbb] line-through">${s.marketRate}</span>
                        <span className="text-[10px] font-bold text-green-600 ml-auto">-{disc}%</span>
                      </div>
                      <p className="text-[9px] font-bold text-green-600 mt-0.5">Save ${s.marketRate - s.price}/mo</p>
                      {/* Dates */}
                      <p className="text-[9px] text-[#9ca3af] mt-0.5">📅 {fmtD(s.availableFrom)} → {fmtD(s.availableTo)}</p>
                      {/* Tags */}
                      <div className="flex items-center gap-1 flex-wrap mt-1">
                        {s.furnished && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">Furnished</span>}
                        {s.utilitiesIncluded && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-green-50 text-green-600">Utils ✓</span>}
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${s.via === 'individual' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                          {s.via === 'individual' ? 'Indiv.' : 'Official'}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      ) : renderBottomStrip()}
    </div>
  );
}
