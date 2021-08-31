import React, { PureComponent } from 'react'
import { PropTypes } from 'prop-types'

const styles = {
  paddingRight: 5,
  height: 32,
  fontSize: 17,
  paddingLeft: 8,
}

export default class DatePicker extends PureComponent {
  static propTypes = {
    date: PropTypes.string,
    mode: PropTypes.string.isRequired,
    minDate: PropTypes.string,
    maxDate: PropTypes.string,
    placeholder: PropTypes.string,
    customStyles: PropTypes.object,
    onDateChange: PropTypes.func.isRequired,
  }

  render = () => (
    <input
      type={this.props.mode === 'datetime' ? 'datetime-local' : this.props.mode}
      onChange={(e) => this.props.onDateChange(e.target.value)}
      defaultValue={this.props.date}
      min={this.props.minDate}
      max={this.props.maxDate}
      placeholder={this.props.placeholder}
      style={{ ...styles, ...this.props.customStyles }}
    />
  )
}
