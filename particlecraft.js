provide('info.ehuber.lab.minimap');

info.ehuber.lab.minimap.ParticleCraft = function(minimapCanvas, zoomedCanvas) {
    var that = this;
    $(document).ready(function() {
            // Infer the total game viewport (minimap by definition sees all),
            var gameSize = 1;
            var gameViewport = {};
            gameViewport.x0 = 0;
            gameViewport.x1 = gameSize * (minimapCanvas.width / minimapCanvas.height);
            gameViewport.y0 = 0;
            gameViewport.y1 = gameSize;
            // make units spread out over entire game space,
            that.makeUnits(10, gameViewport);
            // load sprites, then continue.
            that.waitForSprites(function() {
                    // show zoomed view on mouse hover, also get mouse position.
                    var mouseX, mouseY;
                    $(minimapCanvas).bind('mousemove', function(e) {
                            $(zoomedCanvas).css({
                                    'top': e.pageY + 64,
                                    'left': e.pageX + 64
                                });
                            mouseX = e.pageX - $(minimapCanvas).offset()['left'];
                            mouseY = e.pageY - $(minimapCanvas).offset()['top'];
                    }).bind('mouseover', function() {
                            $(zoomedCanvas).css({'display': ''});
                    }).bind('mouseout', function() {
                            $(zoomedCanvas).css({'display': 'none'});
                    });
                    // Set up interval for update and drawing,
                    var dt = 20;
                    setInterval(function() {
                            // step logic,
                            that.update(dt / 1000);
                            // the viewport is in game units, where
                            // (1, 1) is the right, bottommost corner
                            // of the minimap,
                            var viewport = {};
                            var coordX = mouseX / minimapCanvas.width;
                            var coordY = mouseY / minimapCanvas.height;
                            var viewport_w = 0.25;
                            var viewport_h = (viewport_w / zoomedCanvas.width) * zoomedCanvas.height;
                            viewport.x0 = coordX - (viewport_w / 2);
                            viewport.y0 = coordY - (viewport_h / 2);
                            viewport.x1 = coordX + (viewport_w / 2);
                            viewport.y1 = coordY + (viewport_h / 2);
                            // draw the minimap and zoomed canvases.
                            that.draw(minimapCanvas, viewport);
                            that.drawZoomed(zoomedCanvas, viewport);
                        }, dt);
                });
        });
};

info.ehuber.lab.minimap.ParticleCraft.prototype.makeUnits = function(count, gameViewport) {
    // Prepare c units spread out over the game viewport:
    this.units = [];
    for(var i = count; i > 0; i--) {
        var unit = {};
        // position,
        unit.p = {};
        unit.p.x = gameViewport.x0 + (Math.random() * (gameViewport.x1 - gameViewport.x0));
        unit.p.y = gameViewport.y0 + (Math.random() * (gameViewport.y1 - gameViewport.y0));
        // velocity,
        unit.v = {};
        unit.v.x = 0;
        unit.v.y = 0;
        // frame of animation,
        unit.frame = 1000 * Math.random();
        // done.
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

info.ehuber.lab.minimap.ParticleCraft.prototype.update = function(dt) {
    // For each unit,
    $(this.units).each(function(i, u) {
            // decide whether he's moving or not,
            if (true) {
                //u.p = [u.p.x + (u.v.x * dt), u.p.y + (u.v.y * dt)];
            }
            // decide whether he's changing direction or not.
            if (Math.floor(Math.random(0, 6)) == 0) {
                u.ori = Math.floor(Math.random(0, 8));
            }
        });
};

info.ehuber.lab.minimap.ParticleCraft.prototype.draw = function(minimapCanvas, viewport) {
    if ($(minimapCanvas).is(':visible')) {
        // TEMP
        var ctx = minimapCanvas.getContext('2d');
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
        // For each unit,
        $(this.units).each(function(_, u) {
                // draw a patch.
                ctx.fillStyle = 'rgb(255,0,0)';
                var x = u.p.x * minimapCanvas.width;
                var y = u.p.y * minimapCanvas.height;
                var sz = 2;
                ctx.fillRect(x - sz, y - sz, sz, sz);
            });
        // draw the zoomed viewport.
        ctx.strokeStyle = 'rgb(0,0,0)';
        ctx.lineWidth = 1;
        var lens = {};
        lens.x0 = viewport.x0 * minimapCanvas.width * (minimapCanvas.height / minimapCanvas.width);
        lens.x1 = viewport.x1 * minimapCanvas.width * (minimapCanvas.height / minimapCanvas.width);
        lens.y0 = viewport.y0 * minimapCanvas.height;
        lens.y1 = viewport.y1 * minimapCanvas.height;
        ctx.strokeRect(lens.x0, lens.y0, lens.x1 - lens.x0, lens.y1 - lens.y0);
    }
};

info.ehuber.lab.minimap.ParticleCraft.prototype.drawZoomed = function(zoomedCanvas, viewport) {
    var ctx = zoomedCanvas.getContext('2d');
    if ($(zoomedCanvas).is(':visible')) {
        //TEMP
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, zoomedCanvas.width, zoomedCanvas.height);
        //////
        ctx.fillstyle = 'rgb(255,0,0)';
        $(this.units).each(function(_, u) {
                var sz = 5;
                var screenPX = u.p[0] * zoomedCanvas.width;
                ctx.fillRect(u.p.x - (sz / 2), u.p.y - (sz / 2), sz, sz);
            });
    }
};
