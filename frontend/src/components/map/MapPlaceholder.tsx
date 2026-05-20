import { useEffect, useMemo, useRef } from 'react'
import type { FeatureCollection, LineString, Point } from 'geojson'
import type { Map as MapLibreMap, Marker, StyleSpecification } from 'maplibre-gl'
import type { CaseStudy, ImpactDirection, LayerState, MapPoint } from '../../data/types'
import { directionClass, iconLabelFor, markerOpacityFor, markerSizeFor } from './encoding'
import { countriesGeoJson, landGeoJson } from './mapData'

declare global {
  interface Window {
    __MACROSIGNAL_DISABLE_WEBGL_MAP__?: boolean
  }
}

interface MapPlaceholderProps {
  activeCase: CaseStudy
  layers: LayerState
  selectedEventId: string | null
  selectedRouteId: string | null
  onSelectEvent: (eventId: string) => void
  onSelectRoute: (routeId: string) => void
}

interface RouteProperties {
  direction: string
  id: string
  routeKind: string
  title: string
}

interface RegionProperties {
  direction: string
  severity: number
  title: string
}

const directionColors: Record<ImpactDirection, string> = {
  bullish: '#5bd3b4',
  bearish: '#ff6b6b',
  macro: '#64a6ff',
  mixed: '#f4b860',
  neutral: '#9aa4aa',
  uncertain: '#9aa4aa',
}

const mapStyle = {
  version: 8,
  sources: {
    land: {
      type: 'geojson',
      data: landGeoJson,
    },
    countries: {
      type: 'geojson',
      data: countriesGeoJson,
    },
  },
  layers: [
    {
      id: 'ocean-background',
      type: 'background',
      paint: {
        'background-color': '#07131b',
      },
    },
    {
      id: 'land-fill',
      type: 'fill',
      source: 'land',
      paint: {
        'fill-color': '#2a565f',
        'fill-opacity': 0.82,
      },
    },
    {
      id: 'land-outline',
      type: 'line',
      source: 'land',
      paint: {
        'line-color': 'rgba(158, 211, 213, 0.28)',
        'line-width': 0.7,
      },
    },
    {
      id: 'country-outline',
      type: 'line',
      source: 'countries',
      paint: {
        'line-color': 'rgba(158, 211, 213, 0.16)',
        'line-width': 0.5,
      },
    },
  ],
} satisfies StyleSpecification

function buildRouteData(
  activeCase: CaseStudy,
  showRoutes: boolean,
): FeatureCollection<LineString, RouteProperties> {
  return {
    type: 'FeatureCollection',
    features: showRoutes
      ? activeCase.mapRoutes
          .filter((route) => route.active)
          .map((route) => ({
            type: 'Feature',
            properties: {
              direction: directionClass(route.direction),
              id: route.id,
              routeKind: route.routeKind,
              title: route.title,
            },
            geometry: {
              type: 'LineString',
              coordinates: route.points.map((point) => [
                point.longitude,
                point.latitude,
              ]),
            },
          }))
      : [],
  }
}

function buildRegionData(
  activeCase: CaseStudy,
  showRegions: boolean,
): FeatureCollection<Point, RegionProperties> {
  return {
    type: 'FeatureCollection',
    features: showRegions
      ? activeCase.mapRegions.map((region) => ({
          type: 'Feature',
          properties: {
            direction: directionClass(region.direction),
            severity: region.severity,
            title: region.title,
          },
          geometry: {
            type: 'Point',
            coordinates: [region.position.longitude, region.position.latitude],
          },
        }))
      : [],
  }
}

function collectCaseCoordinates(activeCase: CaseStudy): [number, number][] {
  const points: MapPoint[] = [
    ...activeCase.mapEvents.map((event) => event.position),
    ...activeCase.mapRegions.map((region) => region.position),
    ...activeCase.mapRoutes.flatMap((route) => route.points),
  ]

  return points.map((point) => [point.longitude, point.latitude])
}

function markerClassName(direction: ImpactDirection, severity: number, selected: boolean) {
  return [
    'maplibre-event-marker',
    `maplibre-event-marker--${directionClass(direction)}`,
    `maplibre-event-marker--${markerSizeFor(severity)}`,
    selected ? 'maplibre-event-marker--selected' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function bearingBetween(start: MapPoint, end: MapPoint): number {
  const startLatitude = (start.latitude * Math.PI) / 180
  const endLatitude = (end.latitude * Math.PI) / 180
  const longitudeDelta = ((end.longitude - start.longitude) * Math.PI) / 180
  const y = Math.sin(longitudeDelta) * Math.cos(endLatitude)
  const x =
    Math.cos(startLatitude) * Math.sin(endLatitude) -
    Math.sin(startLatitude) * Math.cos(endLatitude) * Math.cos(longitudeDelta)

  return (Math.atan2(y, x) * 180) / Math.PI
}

function segmentMidpoint(start: MapPoint, end: MapPoint): [number, number] {
  return [
    (start.longitude + end.longitude) / 2,
    (start.latitude + end.latitude) / 2,
  ]
}

export function MapPlaceholder({
  activeCase,
  layers,
  selectedEventId,
  selectedRouteId,
  onSelectEvent,
  onSelectRoute,
}: MapPlaceholderProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const markersRef = useRef<Marker[]>([])
  const routeData = useMemo(
    () => buildRouteData(activeCase, layers.routes),
    [activeCase, layers.routes],
  )
  const regionData = useMemo(
    () => buildRegionData(activeCase, layers.macroRegions),
    [activeCase, layers.macroRegions],
  )

  useEffect(() => {
    let disposed = false
    let map: MapLibreMap | null = null

    async function buildMap() {
      if (!mapContainerRef.current) return
      if (import.meta.env.MODE === 'test') return
      if (window.__MACROSIGNAL_DISABLE_WEBGL_MAP__) return

      try {
        const maplibregl = await import('maplibre-gl')
        if (disposed || !mapContainerRef.current) return

        map = new maplibregl.Map({
          attributionControl: false,
          center: [35, 12],
          container: mapContainerRef.current,
          dragRotate: false,
          interactive: true,
          pitchWithRotate: false,
          renderWorldCopies: false,
          style: mapStyle,
          zoom: 1.25,
        })

        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
        const activeMap = map

        if (layers.chokepoints) {
          const chokepoint = activeCase.mapEvents.find(
            (event) => event.id.includes('bab') || event.title.includes('Bab el-Mandeb'),
          )

          if (chokepoint) {
            const marker = document.createElement('span')
            marker.className = 'maplibre-chokepoint-marker'
            marker.title = 'Bab el-Mandeb chokepoint'
            markersRef.current.push(
              new maplibregl.Marker({ anchor: 'center', element: marker })
                .setLngLat([
                  chokepoint.position.longitude,
                  chokepoint.position.latitude,
                ])
                .addTo(activeMap),
            )
          }
        }

        if (layers.events) {
          activeCase.mapEvents.forEach((event) => {
            const marker = document.createElement('button')
            marker.type = 'button'
            marker.textContent = event.label
            marker.title = `${event.title} (${iconLabelFor(event.type)})`
            marker.setAttribute('aria-label', event.label)
            marker.className = markerClassName(
              event.direction,
              event.severity,
              selectedEventId === event.id,
            )
            marker.style.opacity = String(markerOpacityFor(event.confidence))
            marker.addEventListener('click', () => onSelectEvent(event.id))

            markersRef.current.push(
              new maplibregl.Marker({ anchor: 'center', element: marker })
                .setLngLat([event.position.longitude, event.position.latitude])
                .addTo(activeMap),
            )
          })
        }

        if (layers.routes) {
          activeCase.mapRoutes
            .filter((route) => route.active)
            .forEach((route) => {
              const step = Math.max(2, Math.ceil(route.points.length / 4))
              for (let index = step; index < route.points.length; index += step) {
                const start = route.points[index - 1]
                const end = route.points[index]
                const marker = document.createElement('button')
                marker.type = 'button'
                marker.textContent = '›'
                marker.title = `${route.title} direction`
                marker.setAttribute('aria-label', `${route.title} direction`)
                marker.className = `maplibre-route-arrow-marker maplibre-route-arrow-marker--${directionClass(
                  route.direction,
                )}`
                marker.style.rotate = `${bearingBetween(start, end)}deg`
                marker.addEventListener('click', () => onSelectRoute(route.id))

                markersRef.current.push(
                  new maplibregl.Marker({ anchor: 'center', element: marker })
                    .setLngLat(segmentMidpoint(start, end))
                    .addTo(activeMap),
                )
              }
            })
        }

        let boundsFitted = false
        const fitCaseBounds = () => {
          if (disposed || boundsFitted) return

          const coordinates = collectCaseCoordinates(activeCase)
          if (coordinates.length <= 1) return

          try {
            const bounds = coordinates.reduce(
              (lngLatBounds, coordinate) => lngLatBounds.extend(coordinate),
              new maplibregl.LngLatBounds(coordinates[0], coordinates[0]),
            )
            activeMap.fitBounds(bounds, {
              duration: 0,
              maxZoom: 3.4,
              padding: {
                bottom: 72,
                left: 72,
                right: 72,
                top: 92,
              },
            })
            boundsFitted = true
          } catch {
            window.setTimeout(fitCaseBounds, 150)
          }
        }

        let layersApplied = false
        const applyCaseLayers = () => {
          if (disposed) return
          if (!activeMap.isStyleLoaded()) return
          if (layersApplied) return
          layersApplied = true
          const loadedMap = activeMap

          if (routeData.features.length > 0) {
            loadedMap.addSource('case-routes', {
              type: 'geojson',
              data: routeData,
            })
            loadedMap.addLayer({
              id: 'case-routes-line',
              type: 'line',
              source: 'case-routes',
              layout: {
                'line-cap': 'round',
                'line-join': 'round',
              },
              paint: {
                'line-color': [
                  'match',
                  ['get', 'direction'],
                  'bearish',
                  directionColors.bearish,
                  'mixed',
                  directionColors.mixed,
                  'macro',
                  directionColors.macro,
                  directionColors.bullish,
                ],
                'line-dasharray': [1.5, 1.2],
                'line-opacity': [
                  'case',
                  ['==', ['get', 'id'], selectedRouteId ?? ''],
                  1,
                  0.72,
                ],
                'line-width': [
                  'case',
                  ['==', ['get', 'id'], selectedRouteId ?? ''],
                  5,
                  3,
                ],
              },
            })
            loadedMap.on('click', 'case-routes-line', (event) => {
              const routeId = event.features?.[0]?.properties?.id
              if (typeof routeId === 'string') {
                onSelectRoute(routeId)
              }
            })
            loadedMap.on('mouseenter', 'case-routes-line', () => {
              loadedMap.getCanvas().style.cursor = 'pointer'
            })
            loadedMap.on('mouseleave', 'case-routes-line', () => {
              loadedMap.getCanvas().style.cursor = ''
            })
          }

          if (regionData.features.length > 0) {
            loadedMap.addSource('case-regions', {
              type: 'geojson',
              data: regionData,
            })
            loadedMap.addLayer({
              id: 'case-regions-circle',
              type: 'circle',
              source: 'case-regions',
              paint: {
                'circle-color': [
                  'match',
                  ['get', 'direction'],
                  'bearish',
                  directionColors.bearish,
                  'mixed',
                  directionColors.mixed,
                  'macro',
                  directionColors.macro,
                  directionColors.bullish,
                ],
                'circle-opacity': 0.16,
                'circle-radius': ['+', 11, ['*', ['get', 'severity'], 18]],
                'circle-stroke-color': [
                  'match',
                  ['get', 'direction'],
                  'bearish',
                  directionColors.bearish,
                  'mixed',
                  directionColors.mixed,
                  'macro',
                  directionColors.macro,
                  directionColors.bullish,
                ],
                'circle-stroke-opacity': 0.42,
                'circle-stroke-width': 1,
              },
            })
          }
        }

        if (activeMap.isStyleLoaded()) {
          applyCaseLayers()
        } else {
          activeMap.once('load', applyCaseLayers)
          activeMap.once('idle', applyCaseLayers)
          window.setTimeout(applyCaseLayers, 250)
        }

        activeMap.once('load', fitCaseBounds)
        activeMap.once('idle', fitCaseBounds)
        window.setTimeout(fitCaseBounds, 250)
      } catch {
        // Unit-test environments may not provide WebGL. The accessible hotspot
        // controls below keep the component usable and testable.
      }
    }

    void buildMap()

    return () => {
      disposed = true
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      map?.remove()
    }
  }, [
    activeCase,
    layers,
    onSelectEvent,
    onSelectRoute,
    regionData,
    routeData,
    selectedEventId,
    selectedRouteId,
  ])

  return (
    <section className="map-canvas" aria-label="Global oil intelligence map">
      <div className="map-grid" aria-hidden="true" />
      <div ref={mapContainerRef} className="maplibre-map" aria-hidden="true" />
      <div className="map-vignette" aria-hidden="true" />
      <div className="map-header">
        <div>
          <p className="eyebrow">Map focus</p>
          <h2>{activeCase.region}</h2>
        </div>
        <span className={`impact-pill impact-pill--${activeCase.primaryImpact}`}>
          {activeCase.primaryImpact}
        </span>
      </div>

      {layers.routes && (
        <div className="map-route-selector" aria-label="Route inspector">
          {activeCase.mapRoutes.map((route) => (
            <button
              aria-pressed={selectedRouteId === route.id}
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              type="button"
            >
              {route.title}
            </button>
          ))}
        </div>
      )}

      <div className="map-accessibility-layer">
        {layers.events &&
          activeCase.mapEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => onSelectEvent(event.id)}
              type="button"
            >
              {event.label}
            </button>
          ))}
        {layers.macroRegions &&
          activeCase.mapRegions.map((region) => (
            <span key={region.id}>{region.title}</span>
          ))}
      </div>

      <div className="map-footer">
        <span>Active layers update the map surface</span>
        <strong>{Object.values(layers).filter(Boolean).length}/6 layers</strong>
      </div>
    </section>
  )
}
