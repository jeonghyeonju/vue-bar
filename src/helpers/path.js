import { generateGradientStepsCss } from './gradient'

/**
 *  Calculate the coordinate
 * @param  {number[]|object[]}  arr
 * @param  {object}             boundary
 * @return {object[]}
 */
export function genPoints (inArr, { minX, minY, maxX, maxY, minBarHeight, labelRotate }, { max, min }) {
  const arr = inArr.map(item => (typeof item === 'number' ? item : item.value))
  const minValue = Math.min(...arr, min)
  const maxValue = Math.max(...arr, max)
  const absMaxVal = Math.abs(maxValue)
  const absMinVal = Math.abs(minValue)
  const gridX = (maxX - minX) / (arr.length - 1)
  const labelHeight = 20

  let delta = 0
  if (minValue < 0 && maxValue < 0) {
    delta = absMinVal
  } else if (minValue < 0 && maxValue >= 0) {
    delta = absMinVal + absMaxVal
  } else if (minValue >= 0 && maxValue >= 0) {
    delta = maxValue
  }

  const heightMultiplier = delta !== 0 ? (maxY - minY - labelHeight) / delta : 1
  const yAdjust = minValue * heightMultiplier < minBarHeight ? minBarHeight : 0;
  const zeroLine = minValue < 0 ? absMinVal : 0

  return arr.map((value, index) => {
    const label = typeof inArr[index].title !== 'undefined' ? inArr[index].title : ''
    const title = typeof inArr[index].value === 'number' ? inArr[index].value : inArr[index]
    const height = Math.abs(value)
    const barHeight = (height * heightMultiplier - yAdjust > minBarHeight ? height * heightMultiplier - yAdjust : minBarHeight)
    return {
      x: index * gridX + minX,
      y: maxY - barHeight - (value >= 0 || value === 0 && minValue >= 0 ? zeroLine * heightMultiplier : zeroLine * heightMultiplier - barHeight) - labelHeight - yAdjust,
      height: barHeight,
      label: label,
      title: title
    }
  })
}

export function genBars (_this, arr, h) {
  const { maxX, maxY, labelRotate, labelColor } = _this.boundary
  const totalWidth = (maxX) / (arr.length - 1)
  if (!_this.barWidth) {
    _this.barWidth = totalWidth - (_this.padding || 5)
  }
  if (!_this.rounding) {
    _this.rounding = 2
  }

  let gradients = 0
  if (_this.gradient && _this.gradient.length > 1) {
    gradients = generateGradientStepsCss(_this.gradient[0], _this.gradient[1], (arr.length - 1))
  }
  const offsetX = (totalWidth - _this.barWidth) / 2

  const rects = arr.map((item, index) => {
    return h('rect', {
      attrs: {
        id: `bar-id-${index}`,
        fill: (gradients ? gradients[index] : (_this.gradient[0] ? _this.gradient[0] : '#000')),
        x: item.x - offsetX,
        y: item.y,
        width: _this.barWidth,
        height: item.height,
        rx: _this.rounding,
        ry: _this.rounding
      }
    }, [
      h('animate', {
        attrs: {
          attributeName: 'height',
          from: 0,
          to: item.height,
          dur: `${_this.growDuration}s`,
          fill: 'freeze'
        }
      }),
      h('title', {}, [item.title])
    ])
  })
  const translateOffsetX = labelRotate >= 0 ? 10 : -10
  const xaxis = h(
    'g',
    {
      attrs: {
        class: 'x-axis',
        transform: `translate(${translateOffsetX},${maxY - 8})`
      }
    },
    arr.map((item, index) => {
      const labelOffsetX = labelRotate < 0 ? item.x + offsetX : item.x - offsetX;
      return h(
        'g',
        {
          attrs: {
            class: 'v-bars--tick',
            transform: `translate(${labelOffsetX},0) rotate(${labelRotate})`
          }
        },
        [
          h(
            'text',
            {
              attrs: {
                class: 'v-bars--label-text',
                style: `text-anchor:middle; fill:${labelColor};`,
                'font-size': '0.7em',
                title: item.title
              }
            },
            [
              item.label
            ]
          )
        ]
      )
    })
  )
  return rects.concat(xaxis);
}
