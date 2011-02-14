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
            gameViewport.width = gameViewport.x1 - gameViewport.x0;
            gameViewport.height = gameViewport.y1 - gameViewport.y0;
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
                            // decide the zoomed viewport.
                            var coordX = mouseX / minimapCanvas.width;
                            var coordY = mouseY / minimapCanvas.height;
                            var zoomedViewport = {};
                            zoomedViewport.width = 0.25;
                            zoomedViewport.height = (zoomedViewport.width / zoomedCanvas.width) * zoomedCanvas.height;
                            zoomedViewport.x0 = coordX - (zoomedViewport.width / 2);
                            zoomedViewport.y0 = coordY - (zoomedViewport.height / 2);
                            zoomedViewport.x1 = coordX + (zoomedViewport.width / 2);
                            zoomedViewport.y1 = coordY + (zoomedViewport.height / 2);
                            // draw the minimap and zoomed canvases.
                            that.draw(minimapCanvas, gameViewport, zoomedViewport);
                            that.drawZoomed(zoomedCanvas, zoomedViewport);
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

info.ehuber.lab.minimap.ParticleCraft.prototype.draw = function(minimapCanvas, gameViewport, zoomedViewport) {
    if ($(minimapCanvas).is(':visible')) {
        // TEMP
        var ctx = minimapCanvas.getContext('2d');
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
        ctx.save();
        {
            // For each unit,
            ctx.scale(minimapCanvas.width, minimapCanvas.height); // need transform too, to account for viewport position.
            $(this.units).each(function(_, u) {
                    // draw a patch.
                    ctx.fillStyle = 'rgb(255,0,0)';
                    var half_sz = ((gameViewport.x1 - gameViewport.x0) / 20) / 2;
                    ctx.fillRect(u.p.x - half_sz, u.p.y - half_sz, half_sz, half_sz);
                });
            // And draw the zoomed viewport.
            ctx.strokeStyle = 'rgb(255,255,255)';
            ctx.lineWidth = 0.01; // how to be sure this is visible?
            ctx.strokeRect(zoomedViewport.x0, zoomedViewport.y0, zoomedViewport.width, zoomedViewport.height);
        }
        ctx.restore();
    }
};

info.ehuber.lab.minimap.ParticleCraft.prototype.drawZoomed = function(zoomedCanvas, zoomedViewport) {
    var ctx = zoomedCanvas.getContext('2d');
    if ($(zoomedCanvas).is(':visible')) {
        // Fill in background.
        ctx.fillStyle = 'rgb(100, 100, 100)';
        ctx.fillRect(0, 0, zoomedCanvas.width, zoomedCanvas.height);
        ctx.save();
        {
            // For each unit,
            ctx.scale(zoomedCanvas.height, zoomedCanvas.height);
            ctx.transform(zoomedViewport.x0, zoomedViewport.y0);
            ctx.scale(1 / zoomedViewport.width, 1 / zoomedViewport.width);
            ctx.fillStyle = 'rgb(0,255,0)';
            $(this.units).each(function(_, u) {
                    // draw the sprite!
                    ctx.fillRect(u.p.x - 0.1, u.p.y - 0.1, 0.1, 0.1);
                });
        }
        ctx.restore();
    }
};
