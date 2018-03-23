    const fabric = require('fabric').fabric

    for (var i = 1; i < 9; i++) {
      const canvasWidth = 450
      const canvasHeight = 636
      canvas = new fabric.StaticCanvas()
      canvas.setWidth(canvasWidth)
      canvas.setHeight(canvasHeight)

      canvas.loadFromJSON({ background: 'white',
      objects:
       [ { background: 'white',
      objects:
       [ { ry: 0,
           rx: 0,
           skewY: 0,
           skewX: 0,
           transformMatrix: null,
           globalCompositeOperation: 'source-over',
           paintFirst: 'fill',
           fillRule: 'nonzero',
           backgroundColor: '',
           clipTo: null,
           visible: true,
           shadow: null,
           opacity: 1,
           flipY: false,
           flipX: false,
           angle: 0,
           scaleY: 1,
           scaleX: 1,
           strokeMiterLimit: 10,
           strokeLineJoin: 'miter',
           strokeLineCap: 'butt',
           strokeDashArray: null,
           strokeWidth: 5,
           stroke: 'rgba(34,177,76,1)',
           fill: 'rgba(255,127,39,1)',
           height: 50,
           width: 50,
           top: 50,
           left: 50,
           originY: 'center',
           originX: 'center',
           version: '2.0.1',
           type: 'rect' } ],
      version: '2.0.1' }]})

      canvas.dispose()

      const used = process.memoryUsage().heapUsed / 1024 / 1024;
      console.log(`The script uses approximately ${used} MB`);
    }
  