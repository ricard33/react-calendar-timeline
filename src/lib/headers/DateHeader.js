import React from 'react'
import PropTypes from 'prop-types'
import { TimelineStateConsumer } from '../timeline/TimelineStateContext'
import CustomHeader from './CustomHeader'
import { getNextUnit } from '../utility/calendar'
import { defaultHeaderFormats } from '../default-config'
import memoize from 'memoize-one'
import { CustomDateHeader } from './CustomDateHeader'
import { format as _format } from 'date-fns'
import DateContext from '../DateContext'

class DateHeader extends React.Component {
  static propTypes = {
    unit: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    timelineUnit: PropTypes.string,
    labelFormat: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
      PropTypes.string
    ]).isRequired,
    intervalRenderer: PropTypes.func,
    headerData: PropTypes.object,
    height: PropTypes.number
  }

  static contextType = DateContext

  getHeaderUnit = () => {
    if (this.props.unit === 'primaryHeader') {
      return getNextUnit(this.props.timelineUnit)
    } else if (this.props.unit) {
      return this.props.unit
    }
    return this.props.timelineUnit
  }

  getRootStyle = memoize((style) => {
    return {
      height: 30,
      ...style
    }
  })

  getLabelFormat = (interval, unit, labelWidth) => {
    const { labelFormat } = this.props
    if (typeof labelFormat === 'string') {
      const startTime = interval[0]
      return _format(startTime, labelFormat, { locale: this.context.locale })
    } else if (typeof labelFormat === 'function') {
      return labelFormat(interval, unit, labelWidth, this.context)
    } else {
      throw new Error('labelFormat should be function or string')
    }
  }

  getHeaderData = memoize(
    (
      intervalRenderer,
      style,
      className,
      getLabelFormat,
      unitProp,
      headerData
    ) => {
      return {
        intervalRenderer,
        style,
        className,
        getLabelFormat,
        unitProp,
        headerData
      }
    }
  )

  render() {
    const unit = this.getHeaderUnit()
    const { headerData, height } = this.props
    return (
      <CustomHeader
        unit={unit}
        height={height}
        headerData={this.getHeaderData(
          this.props.intervalRenderer,
          this.getRootStyle(this.props.style),
          this.props.className,
          this.getLabelFormat,
          this.props.unit,
          this.props.headerData
        )}
        children={CustomDateHeader}
      />
    )
  }
}

const DateHeaderWrapper = ({
  unit,
  labelFormat,
  style,
  className,
  intervalRenderer,
  headerData,
  height
}) => (
  <TimelineStateConsumer>
    {({ getTimelineState }) => {
      const timelineState = getTimelineState()
      return (
        <DateHeader
          timelineUnit={timelineState.timelineUnit}
          unit={unit}
          labelFormat={labelFormat}
          style={style}
          className={className}
          intervalRenderer={intervalRenderer}
          headerData={headerData}
          height={height}
        />
      )
    }}
  </TimelineStateConsumer>
)

DateHeaderWrapper.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,
  unit: PropTypes.string,
  labelFormat: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
    PropTypes.string
  ]),
  intervalRenderer: PropTypes.func,
  headerData: PropTypes.object,
  height: PropTypes.number
}

DateHeaderWrapper.defaultProps = {
  labelFormat: formatLabel
}

function formatLabel(
  [timeStart, timeEnd],
  unit,
  labelWidth,
  dateContext,
  formatOptions = defaultHeaderFormats
) {
  let format
  if (labelWidth >= 150) {
    format = formatOptions[unit]['long']
  } else if (labelWidth >= 100) {
    format = formatOptions[unit]['mediumLong']
  } else if (labelWidth >= 50) {
    format = formatOptions[unit]['medium']
  } else {
    format = formatOptions[unit]['short']
  }
  return _format(timeStart, format, { locale: dateContext.locale })
}

export default DateHeaderWrapper
