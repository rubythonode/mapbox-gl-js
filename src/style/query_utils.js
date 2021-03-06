// @flow

const Point = require('@mapbox/point-geometry');

import type {PossiblyEvaluatedPropertyValue} from "./properties";
import type StyleLayer from '../style/style_layer';
import type {Bucket} from '../data/bucket';

function getMaximumPaintValue(property: string, layer: StyleLayer, bucket: Bucket): number {
    const value = ((layer.paint: any).get(property): PossiblyEvaluatedPropertyValue<any>).value;
    if (value.kind === 'constant') {
        return value.value;
    } else {
        return (bucket: any).programConfigurations.get(layer.id)
            .paintPropertyStatistics[property].max;
    }
}

function translateDistance(translate: [number, number]) {
    return Math.sqrt(translate[0] * translate[0] + translate[1] * translate[1]);
}

function translate(queryGeometry: Array<Array<Point>>,
                   translate: [number, number],
                   translateAnchor: 'viewport' | 'map',
                   bearing: number,
                   pixelsToTileUnits: number) {
    if (!translate[0] && !translate[1]) {
        return queryGeometry;
    }

    const pt = Point.convert(translate);

    if (translateAnchor === "viewport") {
        pt._rotate(-bearing);
    }

    const translated = [];
    for (let i = 0; i < queryGeometry.length; i++) {
        const ring = queryGeometry[i];
        const translatedRing = [];
        for (let k = 0; k < ring.length; k++) {
            translatedRing.push(ring[k].sub(pt._mult(pixelsToTileUnits)));
        }
        translated.push(translatedRing);
    }
    return translated;
}

module.exports = {
    getMaximumPaintValue,
    translateDistance,
    translate
};
