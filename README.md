# Mapbox GL-JS RangeSlider

A Mapbox GL port of the [Leaflet.RangeSlider plugin](https://github.com/flypdx/LeafletRangeSlider) that adds a two-handled slider control to a map. This control dynamically filters GeoJSON features based on whether each feature's properties are within the range currently selected on the slider.

The filtered properties may be ISO 8601 Dates, Epochs, integers, or floats.

The control can filter on a single property, or two distinct properties of each feature, as long as both properties are of the same type.

The plugin also:

* Introspects the property field(s) to determine the minimum and maximum values of the specified field(s)
* Can be configured to include features with property ranges which start in, or end in, or are a superset of the selected range
* Displays a text description of the current range used to filter features


### Other Dependencies
* [noUISlider](https://refreshless.com/nouislider/)
* [Moment.js](http://momentjs.com/)

## Demo
![demo](http://g.recordit.co/t3kgYnBwXs.gif)

## Options

The following properties can be specified in the options object used to initialize the range slider:

### General/Meta Properties
* **elm**: unique identifier for DOM elements as they pertain to the range slider
    * At the top level - the elm (ex.`slider-control`) is a container with the class `elm + 'container'` (ex. `.slider-control-container`).
    * The container's first child element is the range display - (ex. `.slider-control-range-display`)
    * Second child is the control itself using the elm as an ID - (ex. `#slider-control`)
* **layer**: Mapbox GL layer ID
* **source**: Mapbox GL source ID
* **input**: Boolean (true/false) that allows for text input range changes when set to `true`


### Filtered Properties

* **minProperty**: Name of the specific property of each GeoJSON feature object used for comparison with the minimum handle. For example, if this is "StartDate" then the comparison would be: value of feature's "StartDate" property is greater than or equal to the value of the minimum handle.
* **maxProperty**: Name of the specific property of a GeoJSON feature object used for comparison with the maximum handle. For example, if this is "EndDate" then the comparison would be: value of feature's "EndDate" property is less than or equal to the value of the maximum handle. When the range slider is used to filter against a single feature property, this would be the same as minProperty.
* **propertyType**: Used for casting the property before comparison. Possible values are: `iso8601`, `epoch`, `integer`, or `float`
* **rangeDescriptionFormat**: `float`, `integer`, `shortDate`, `mediumDate`, or `longDate`
* **descriptionPrefix**: A string added to the beginning of the text which displays the current range

### Filter Behavior Properties

* **rangeType** can be one of three string values:
   * **contained**: the feature.min and feature.max properties are both within slider's selected range. This is the default.
   * **startsIn**: the feature.min is within the slider's selected range, but feature.max might be greater than slider's selected max.
   * **endsIn**: the feature.max is within slider's selected range, but feature.min might be less than slider's selected minimum.
* **showOngoing**: Boolean, defaults to false. Shows feature if the selected range is between feature.min and feature.max, i.e. the values in the slider's selected range are a subset of those between the feature's min and max.

Note: When showOngoing is set to true, the control will also show features if they start in or end in the selected range. As we tested the plug in, this seemed like the most intuitive behavior, but it also means it might not make sense to allow showOngoing to be true and rangeType to be 'contained', because showOngoing overrides that particular rangeType value.

### Slider Properties

* **sliderMin**: By default, the slider's minimum value will be set to the minimum value of the minProperty in the data. A value specified for sliderMin would override the introspected value.
* **sliderMax**: Similar to sliderMin, this can be used to override the default introspected value, which would be the maximum value found in the maxProperty of the data.
* **filterMin**: Initial value of the minimum handle on page load. (Defaults to 15 % of max - min.)
* **filterMax**: Initial value of the maximum handle on page load. (Defaults to 85% of max - min.)
