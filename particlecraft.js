provide('info.ehuber.lab.minimap');

info.ehuber.lab.minimap.ParticleCraft = function(minimapCanvas, zoomedCanvas) {
    var that = this;
    $(document).ready(function() {
            // Make units,
            that.makeUnits();
            // load sprites, then continue.
            that.waitForSprites(function() {
                    // show zoomed view on mouse hover, also get mouse position.
                    var mouseX, mouseY;
                    $(minimapCanvas).bind('mousemove', function(e) {
                            $(zoomedCanvas).css({
                                    'top': e.pageY + 64,
                                    'left': e.pageX + 64
                                });
                            mouseX = e.pageX;
                            mouseY = e.pageY;
                    }).bind('mouseover', function() {
                            $(zoomedCanvas).css({'display': ''});
                    }).bind('mouseout', function() {
                            $(zoomedCanvas).css({'display': 'none'});
                    });
                    // Set up interval for update and drawing,
                    setInterval(function() {
                            that.update();
                            var viewport = {
                                'x0': mouseX - 64,
                                'y0': mouseY - 64,
                                'x1': mouseX + 64,
                                'x2': mouseY + 64,
                            };
                            that.draw(minimapCanvas, viewport);
                            that.drawZoomed(zoomedCanvas, viewport);
                        }, 20);
                });
        });
};

info.ehuber.lab.minimap.ParticleCraft.prototype.makeUnits = function() {
    this.units = [];
    for(var i = 10; i > 0; i--) {
        var unit = {};
        unit.p = [Math.random(), Math.random()];
        unit.v = [Math.random(), Math.random()];
        unit.v = Math.sqrt(Math.pow(unit.v[0], 2), Math.pow(unit.v[1], 2));
        unit.v_len = 0;
        unit.frame = 1000 * Math.random();
        this.units.push(unit);
    }
};

info.ehuber.lab.minimap.ParticleCraft.prototype.waitForSprites = function(cont) {
    var sprites = $.makeArray($('.sprite'));
    var remaining = sprites.length;
    $('.sprite').load(function() {
            remaining--;
            return false;
        });
    var waiting = function () {
        if (remaining == 0) {
            console.log('done loading sprites');
            cont();
        } else {
            console.log(remaining + ' sprites loading');
            setTimeout(waiting, 250);
        }
    };
    waiting();
};

info.ehuber.lab.minimap.ParticleCraft.prototype.update = function() {
    // Move units, avoiding each other.
    // TODO.
};

info.ehuber.lab.minimap.ParticleCraft.prototype.draw = function(minimapCanvas, viewport) {
    if ($(minimapCanvas).is(':visible')) {
        var ctx = minimapCanvas.getContext('2d');
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
        // For each unit,
        $(this.units).each(function(_, u) {
                // draw a patch.
                ctx.fillStyle = 'rgb(255,0,0)';
                var x = u.p[0] * minimapCanvas.width;
                var y = u.p[1] * minimapCanvas.height;
                var sz = 2;
                ctx.fillRect(x - sz, y - sz, x + sz, y + sz);
            });
        // draw the zoomed viewport.
        ctx.strokeStyle = 'rgb(0,0,0)';
        ctx.strokeRect(viewport['x0'], viewport['y0'], viewport['x1'], viewport['y1']);
    }
};

info.ehuber.lab.minimap.ParticleCraft.prototype.drawZoomed = function(zoomedCanvas, viewport) {
    if ($(zoomedCanvas).is(':visible')) {
        //TEMP
        var ctx = zoomedCanvas.getContext('2d');
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, zoomedCanvas.width, zoomedCanvas.height);
        //////
        // Draw viewport on minimap canvas,
        
        // position the zoomed canvas,
        
        // and draw the zoomed view.
    }
};
