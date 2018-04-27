'use strict';

function RangeSlider(options) {
    this.options = {
        elm: options.elm, //required
        layer: options.layer, //required
        source: options.source, //required
        minProperty: options.minProperty, //required
        maxProperty: options.maxProperty, //required
        propertyType: options.propertyType ? options.propertyType : 'iso8601', // or: epoch, integer, float
        rangeType: options.rangeType ? options.rangeType :'contained', // or: startsIn, endsIn
        showOngoing: options.showOngoing ? options.showOngoing : false,
        rangeDescriptionFormat: options.rangeDescriptionFormat ? options.rangeDescriptionFormat : '', // float, integer, shortDate, mediumDate, longDate
        descriptionPrefix: options.descriptionPrefix ? options.descriptionPrefix : 'Range', // a space will be appended before range values
        sliderMin: options.sliderMin ? options.sliderMin : null,
        sliderMax: options.sliderMax ? options.sliderMax : null,
        filterMin: options.filterMin ? options.filterMin : null,
        filterMax: options.filterMax ? options.filterMax : null,
        controlWidth: options.controlWidth ? options.controlWidth : '200px',
        input: options.input ? options.input : false
    }
}

function dateStringFromEpoch(epoch, formatString) {

    var momentFromEpoch = moment(epoch);
    return momentFromEpoch.format(formatString);
}

function iso8601StringToEpoch(dateString) {

    // conversion from string without a defined format is deprecated
    //var momentFromString = moment(dateString);
    var formatString = "YYYY-MM-DD HH:mm:ss.SSSZ";
    var momentFromString = moment(dateString, formatString);
    if (momentFromString.isValid()) {
        return momentFromString.valueOf();
    } else {
        console.log('ERROR: Invalid date string: ' + dateString);
        return 0;
    }
}

function convertUserInputFormat(that, val) {
    if (that.options.propertyType === 'iso8601') {
        var mom = moment(val);
        if (mom.isValid()) {
            return mom.unix();
        }
    }
}

RangeSlider.prototype.onAdd = function(map) {
    var options = this.options;
    RangeSlider.prototype.options = options;
    var elm = this.options.elm;

    this._map = map;
    this._container = document.createElement('div');
    this._container.className = elm + '-container';
    this._container.style.pointerEvents = 'auto';
    this._container.style.display = "none";

    var displayDiv = document.createElement('div');
    displayDiv.className = elm + '-range-display';
    displayDiv.style.width = this.options.controlWidth;
    displayDiv.style.marginBottom = '13px';
    displayDiv.style.textAlign = 'center';
    displayDiv.style.borderRadius = '5px';
    displayDiv.style.backgroundColor = '#FFF'

    this._container.appendChild(displayDiv);

    var sliderDiv = document.createElement('div');
    sliderDiv.id = elm;
    sliderDiv.style.width = this.options.controlWidth;

    this._container.appendChild(sliderDiv);

    if (options.input) {
        var inputDiv = document.createElement('div');
        var minInput = document.createElement ('input');
        var maxInput = document.createElement ('input');

        inputDiv.className = 'input-container';
        inputDiv.style.marginTop = '10px';

        minInput.id = 'min-' + elm;
        maxInput.id = 'max-' + elm;

        minInput.style.display = 'inline';
        minInput.style.float = 'left';
        maxInput.style.display = 'inline';
        maxInput.style.float = 'right';

        inputDiv.appendChild(minInput);
        inputDiv.appendChild(maxInput);
        this._container.appendChild(inputDiv);

    }

    //watch for when dom elm finally exists
    var observer = new MutationObserver(function(m) {
        if (document.getElementById(elm)) {
            RangeSlider.prototype.configureRangeSlider(options, map);
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true });

    return this._container;
}

RangeSlider.prototype.onRemove = function() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
}

RangeSlider.prototype.calculateMinMaxValuesForLayer = function(map) {

    var layerID = this.options.layer,
        sourceID = this.options.source,
        minFieldValue = Number.MAX_VALUE,
        maxFieldValue = Number.MIN_VALUE;

    var feats = map.querySourceFeatures(sourceID);

    for (var i = 0; i < feats.length; i++) {
        var minFeatureValue, maxFeatureValue;

        if (this.options.propertyType === 'iso8601') {
            // convert to epoch
            var minDateValue = feats[i].properties[this.options.minProperty];
            var minDate = new Date(minDateValue);
            minFeatureValue = minDate.getTime();

            var maxDateValue = feats[i].properties[this.options.maxProperty];
            var maxDate = new Date(maxDateValue);
            maxFeatureValue = maxDate.getTime();

        } else {
            minFeatureValue = feats[i].properties[this.options.minProperty];
            maxFeatureValue = feats[i].properties[this.options.maxProperty];
        }

        if (minFeatureValue > maxFeatureValue) {
            console.error('ERROR: min > max for feature with properties: ' + JSON.stringify(feats[i].properties));
        }

        if (minFeatureValue < minFieldValue) {
            minFieldValue = minFeatureValue;
        }

        if (maxFeatureValue > maxFieldValue) {
            maxFieldValue = maxFeatureValue;
        }
    }

    if (this.options.propertyType === 'iso8601') {

        var minDate = new Date(minFieldValue);
        var maxDate = new Date(maxFieldValue);

        console.log('Range would be ' + minDate + ' to ' + maxDate);
    } else {
        console.log('Range would be ' + minFieldValue + ' to ' + maxFieldValue);
    }

    self.calculatedMinValue = minFieldValue;
    self.calculatedMaxValue = maxFieldValue;

}

RangeSlider.prototype.sliderMinimumValue = function() {
    if (this.options.sliderMin) {

        var specifiedMinValue;
        if (this.options.propertyType === 'iso8601') {
            specifiedMinValue = iso8601StringToEpoch(this.options.sliderMin);
        } else {
            specifiedMinValue = this.options.sliderMin;
        }

        if (specifiedMinValue >= self.calculatedMinValue) {
            return specifiedMinValue;
        } else {
            return calculatedMinValue;
        }
    } else {
        return calculatedMinValue;
    }
}

RangeSlider.prototype.sliderMaximumValue = function() {
    if (this.options.sliderMax) {

        var specifiedMaxValue;
        if (this.options.propertyType === 'iso8601') {
            specifiedMaxValue = iso8601StringToEpoch(this.options.sliderMax);
        } else {
            specifiedMaxValue = this.options.sliderMax;
        }

        if (specifiedMaxValue <= self.calculatedMaxValue) {
            return specifiedMaxValue;
        } else {
            return self.calculatedMaxValue;
        }
    } else {
        return self.calculatedMaxValue;
    }
}

RangeSlider.prototype.initialSliderValues = function() {
    var sliderMin = this.sliderMinimumValue();
    var sliderMax = this.sliderMaximumValue();

    var initialMin, initialMax;

    var specifiedInitialMinValue, specifiedInitialMaxValue;
    if (this.options.propertyType === 'iso8601') {
        specifiedInitialMinValue = iso8601StringToEpoch(this.options.filterMin);
        specifiedInitialMaxValue = iso8601StringToEpoch(this.options.filterMax);
    } else {
        specifiedInitialMinValue = this.options.filterMin;
        specifiedInitialMaxValue = this.options.filterMax;
    }

    if (specifiedInitialMinValue >= sliderMin && specifiedInitialMaxValue <= sliderMax) {
        initialMin = specifiedInitialMinValue;
        initialMax = specifiedInitialMaxValue;
    } else {

        console.log('ERROR: Filter range ' + specifiedInitialMinValue + ' to ' + specifiedInitialMaxValue + ' is out of range of the slider values.');

        // fallback to defaults
        var rangeMinPosition = 0.15;
        var rangeMaxPosition = 0.85;

        initialMin = ((sliderMax - sliderMin) * rangeMinPosition) + sliderMin;
        initialMax = ((sliderMax - sliderMin) * rangeMaxPosition) + sliderMin;
    }

    return [initialMin, initialMax];
}

RangeSlider.prototype.updateRangeDisplay = function(vals) {

    var rawMinValue = Math.round(vals[0]);
    var rawMaxValue = Math.round(vals[1]);

    var minFilterValue, maxFilterValue;
    switch (this.options.rangeDescriptionFormat) {
        case 'float':
            {
                minFilterValue = Number(rawMinValue).toFixed(4);
                maxFilterValue = Number(rawMaxValue).toFixed(4);
                break;
            }

        case 'integer':
            {
                minFilterValue = rawMinValue;
                maxFilterValue = rawMaxValue;
                break;
            }

        case 'shortDate':
            {
                //var formatString = 'MM/DD/YY';
                var formatString = 'l';

                minFilterValue = dateStringFromEpoch(rawMinValue, formatString);
                maxFilterValue = dateStringFromEpoch(rawMaxValue, formatString);
                break;
            }

        case 'mediumDate':
            {
                //var formatString = 'MMM D, YYYY';
                var formatString = 'LLL';
                minFilterValue = dateStringFromEpoch(rawMinValue, formatString);
                maxFilterValue = dateStringFromEpoch(rawMaxValue, formatString);
                break;
            }

        case 'longDate':
            {
                //var formatString = 'dddd, MMMM Do, YYYY [at] h:mm:ss';
                var formatString = 'LLLL';
                minFilterValue = dateStringFromEpoch(rawMinValue, formatString);
                maxFilterValue = dateStringFromEpoch(rawMaxValue, formatString);
                break;
            }

        default:
            {
                console.log('ERROR: Invalid rangeDescriptionFormat value in options: ' + options.rangeDescriptionFormat);
                console.log('Valid values are: float, integer, shortDate, mediumDate, longDate');
                // default handling will show raw value from slider
                break;
            }
    }
    //remove
    var elem = document.querySelector('.' + this.options.elm + '-text-display');
    if (elem) {
        elem.parentNode.removeChild(elem);
    }

    var textElm = document.createElement('div');
    textElm.className = this.options.elm + '-text-display';

    var text = document.createTextNode(this.options.descriptionPrefix + ' ' + minFilterValue + ' to ' + maxFilterValue);
    textElm.appendChild(text);

    document.querySelector('.' + this.options.elm + '-range-display').appendChild(textElm);

    if (this.options.input) {
        document.getElementById('min-' + this.options.elm).value = minFilterValue;
        document.getElementById('max-' + this.options.elm).value = maxFilterValue;
    }
}

RangeSlider.prototype.convertInputValues = function(val) {
    var newVal = '';

    switch (this.options.rangeDescriptionFormat) {
        case 'float':
            {
                newVal = parseFloat(val)
                break;
            }

        case 'integer':
            {
                newVal = parseInt(val);
                break;
            }

        case 'shortDate':
            {
                //var formatString = 'MM/DD/YY';
                var formatString = 'l';
                newVal = dateStringFromEpoch(rawMaxValue, formatString);
                break;
            }

        case 'mediumDate':
            {
                //var formatString = 'MMM D, YYYY';
                var formatString = 'LLL';
                minFilterValue = dateStringFromEpoch(rawMinValue, formatString);
                maxFilterValue = dateStringFromEpoch(rawMaxValue, formatString);
                break;
            }

        case 'longDate':
            {
                //var formatString = 'dddd, MMMM Do, YYYY [at] h:mm:ss';
                var formatString = 'LLLL';
                minFilterValue = dateStringFromEpoch(rawMinValue, formatString);
                maxFilterValue = dateStringFromEpoch(rawMaxValue, formatString);
                break;
            }
        }
}
RangeSlider.prototype.displayFilteredFeatures = function(map, vals) {
    var that = this;
    var feats = map.querySourceFeatures(this.options.source);

    if (feats) {
        var keepFeats = feats.filter(function(f){
            return (that.rangeFeatureFilter(f, vals))
        });

        var gj = {
          "type": "FeatureCollection",
          "features": keepFeats
        };

        map.getSource('demo').setData(gj);
    }
}

RangeSlider.prototype.rangeFeatureFilter = function(feature, vals) {
    var rawMinValue = vals[0];
    var rawMaxValue = vals[1];
    var minPropertyValue, maxPropertyValue, currentRange;

    if (this.options.propertyType === 'iso8601') {
      // convert date strings to epoch values for comparison
      minPropertyValue = iso8601StringToEpoch(feature.properties[this.options.minProperty]);
      maxPropertyValue = iso8601StringToEpoch(feature.properties[this.options.maxProperty]);
      currentRange = [new Date(rawMinValue), new Date(rawMaxValue)];
    } else {
      minPropertyValue = feature.properties[this.options.minProperty];
      maxPropertyValue = feature.properties[this.options.maxProperty];
      currentRange = [rawMinValue, rawMaxValue];
    }

    var inRange = false;
    var startsWithinRange = (minPropertyValue >= currentRange[0]) && (minPropertyValue <= currentRange[1]);;
    var endsWithinRange = (maxPropertyValue >= currentRange[0]) && (maxPropertyValue <= currentRange[1]);

    switch (this.options.rangeType) {
      case 'contained': {
        var gteMinimum = minPropertyValue >= currentRange[0];
        var lteMaximum = maxPropertyValue <= currentRange[1];
        inRange = gteMinimum && lteMaximum;
        break;
      }

      case 'startsIn': {
        inRange = startsWithinRange;
        break;
      }

      case 'endsIn': {
        inRange = endsWithinRange;
        break;
      }

      default: {
        console.log('ERROR: ' + this.options.rangeType + ' is not a valid rangeType.');
        break;
      }
    }

    var ongoing = false;

    if (this.options.showOngoing) {

      var filterWithinPropertyRange = (currentRange[0] >= minPropertyValue) && (currentRange[1] <= maxPropertyValue);
      ongoing = filterWithinPropertyRange || startsWithinRange || endsWithinRange;
    }

    if (inRange || ongoing) {
      //console.log('Will show: ' + feature.properties[self.options.minProperty], feature.properties[self.options.maxProperty]);
      return true;
    } else {
      //console.log('Will not show: ' + feature.properties[self.options.minProperty], feature.properties[self.options.maxProperty]);
      return false;
    }
}

RangeSlider.prototype.configureRangeSlider = function() {
    var that = this;

    var sourceIsLoaded = function() {
        if (map.getSource(that.options.source) && map.isSourceLoaded(that.options.source)) {
            RangeSlider.prototype.calculateMinMaxValuesForLayer(map);
            document.querySelector('.' + that.options.elm + '-container').style.display = 'block'

            var sliderMin = that.sliderMinimumValue();
            var sliderMax = that.sliderMaximumValue();
            var sliderInitialValues = that.initialSliderValues();

            var mbSlider = document.getElementById(that.options.elm);

            noUiSlider.create(mbSlider, {
                start: sliderInitialValues,
                connect: true,
                range: {
                    'min': sliderMin,
                    'max': sliderMax
                }
            });

            mbSlider.noUiSlider.on('update', function(val, handle) {
                var options = that.options;
                var vals = [ Math.round(val[0]), Math.round(val[1]) ];

                that.displayFilteredFeatures(map, vals);
                that.updateRangeDisplay(vals);
            })

            if (that.options.input) {
                var minInput = document.getElementById('min-' + that.options.elm);
                var maxInput = document.getElementById('max-' + that.options.elm);

                minInput.addEventListener('change', function() {
                    // that.convertInputValues(this.value)
                    mbSlider.noUiSlider.set(convertUserInputFormat(that, this.value));
                });

                maxInput.addEventListener('change', function() {
                    that.convertInputValues(this.value)
                    //mbSlider.noUiSlider.set([null, this.value]);
                });
            }

            map.off('render', sourceIsLoaded)
        }
    }

    map.on('render', sourceIsLoaded);

}