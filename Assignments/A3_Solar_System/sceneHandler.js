

var mouseDown = false,
pageX = 0;

function onMouseMove(evt)
{
    if (!mouseDown)
        return;

    evt.preventDefault();

    var deltax = evt.pageX - pageX;
    pageX = evt.pageX;
    rotateScene(deltax);
}

function onMouseDown(evt)
{
    evt.preventDefault();

    mouseDown = true;
    pageX = evt.pageX;
}

function onMouseUp(evt)
{
    evt.preventDefault();

    mouseDown = false;
}

function addMouseHandler(canvas)
{
canvas.addEventListener( 'mousemove',
        function(e) { onMouseMove(e); }, false );
canvas.addEventListener( 'mousedown',
        function(e) { onMouseDown(e); }, false );
canvas.addEventListener( 'mouseup',
        function(e) { onMouseUp(e); }, false );
}
