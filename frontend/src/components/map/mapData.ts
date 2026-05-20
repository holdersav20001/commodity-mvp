import { feature } from 'topojson-client'
import countriesTopology from 'world-atlas/countries-110m.json'
import landTopology from 'world-atlas/land-110m.json'
import type { FeatureCollection, Geometry } from 'geojson'
import type { GeometryCollection, Topology } from 'topojson-specification'

const landTopoJson = landTopology as unknown as Topology<{
  land: GeometryCollection
}>

const countriesTopoJson = countriesTopology as unknown as Topology<{
  countries: GeometryCollection
}>

export const landGeoJson = feature(
  landTopoJson,
  landTopoJson.objects.land,
) as FeatureCollection<Geometry>

export const countriesGeoJson = feature(
  countriesTopoJson,
  countriesTopoJson.objects.countries,
) as FeatureCollection<Geometry>
