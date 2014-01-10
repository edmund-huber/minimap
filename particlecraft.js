ParticleCraft = function(minimapCanvas, zoomedCanvas) {
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
            that.makeUnits(20, gameViewport);
            // load sprites, then continue.
            that.waitForSprites(function() {
                    // show zoomed view on mouse hover, also get mouse position.
                    var mouseX, mouseY;
                    $(minimapCanvas).bind('mousemove', function(e) {
                            $(zoomedCanvas).css({
                                    'top': e.pageY + 32,
                                    'left': e.pageX + 32
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
                            that.update(dt / 1000, (new Date()).getTime() / 1000, gameViewport);
                            // decide the zoomed viewport.
                            var coordX = mouseX / minimapCanvas.height;
                            var coordY = mouseY / minimapCanvas.height;
                            var zoomedViewport = {};
                            zoomedViewport.width = 0.25;
                            zoomedViewport.height = (zoomedViewport.width / zoomedCanvas.width) * zoomedCanvas.height;
                            zoomedViewport.x0 = coordX - (zoomedViewport.width / 2);
                            zoomedViewport.y0 = coordY - (zoomedViewport.height / 2);
                            zoomedViewport.x1 = coordX + (zoomedViewport.width / 2);
                            zoomedViewport.y1 = coordY + (zoomedViewport.height / 2);
                            // draw the minimap and zoomed canvases.
                            that.draw(minimapCanvas, gameViewport, zoomedCanvas, zoomedViewport);
                            that.drawZoomed(gameViewport, zoomedCanvas, zoomedViewport);
                        }, dt);
                });
        });
};

ParticleCraft.prototype.makeUnits = function(count, gameViewport) {
    // Prepare c units spread out over the game viewport:
    this.units = [];
    for(var i = count; i > 0; i--) {
        var unit = {};
        // position,
        unit.p = {};
        unit.p.x = gameViewport.x0 + (Math.random() * (gameViewport.x1 - gameViewport.x0));
        unit.p.y = gameViewport.y0 + (Math.random() * (gameViewport.y1 - gameViewport.y0));
        // orienation,
        unit.ori = 0;
        // frame of animation,
        unit.nextFrame = ((new Date()).getTime() / 1000) + (Math.random() * 3);
        unit.frame = 0;
        // done.
        this.units.push(unit);
    }
};

ParticleCraft.prototype.waitForSprites = function(cont) {
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

ParticleCraft.prototype.update = function(dt, now, gameViewport) {
    // For each unit,
    $(this.units).each(function(_, u) {
            // time for a new animation frame?
            if (now >= u.nextFrame) {
                u.frame = (u.frame + 1) % 8;
                u.nextFrame = now + 0.1;
            }
            // Move him along,
            var ori_to_v = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
            var v = ori_to_v[u.ori];
            var len_v = 0.05 * Math.sqrt((v[0] * v[0]) + (v[1] * v[1]));
            var v_x = v[0] * len_v;
            var v_y = v[1] * len_v;
            u.p.x += v_x * dt;
            u.p.y += v_y * dt;
            // and mirror him back into game if he leaves the gameViewport.
            if (u.p.x < gameViewport.x0) {
                u.p.x = gameViewport.x1;
            } else if (u.p.x > gameViewport.x1) {
                u.p.x = gameViewport.x0;
            }
            if (u.p.y < gameViewport.y0) {
                u.p.y = gameViewport.y1;
            } else if (u.p.y > gameViewport.y1) {
                u.p.y = gameViewport.y0;
            }
            // Decide whether he's changing direction or not.
            if (Math.floor(Math.random(0) * 64) == 0) {
                u.ori = u.ori + (1 - Math.floor(Math.random() * 3));
                if (u.ori < 0) {
                    u.ori = 7;
                } else {
                    u.ori = u.ori % 8;
                }
            }
        });
};

ParticleCraft.prototype.draw = function(minimapCanvas, gameViewport, zoomedCanvas, zoomedViewport) {
    if ($(minimapCanvas).is(':visible')) {
        var ctx = minimapCanvas.getContext('2d');
        // Fill in the background.
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
        ctx.save();
        {
            // For each unit,
            ctx.scale(minimapCanvas.height, minimapCanvas.height);            
            // need translate() too, to account for viewport position. Meh
            $(this.units).each(function(_, u) {
                    // draw a patch.
                    ctx.fillStyle = 'rgb(255,0,0)';
                    var half_sz = ((gameViewport.x1 - gameViewport.x0) / 10) / 2;
                    ctx.fillRect(u.p.x - half_sz, u.p.y - half_sz, half_sz, half_sz);
                });
            // And draw the zoomed viewport if showing zoomed canvas.
            if ($(zoomedCanvas).is(':visible')) {
                ctx.strokeStyle = 'rgb(255,255,255)';
                ctx.lineWidth = 0.01; // how to be sure this is visible?
                ctx.strokeRect(zoomedViewport.x0, zoomedViewport.y0, zoomedViewport.width, zoomedViewport.height);
            }
        }
        ctx.restore();
    }
};

ParticleCraft.prototype.drawZoomed = function(gameViewport, zoomedCanvas, zoomedViewport) {
    if ($(zoomedCanvas).is(':visible')) {
        var ctx = zoomedCanvas.getContext('2d');
        // Fill in background.
        ctx.fillStyle = 'rgb(100, 100, 100)';
        ctx.fillRect(0, 0, zoomedCanvas.width, zoomedCanvas.height);
        ctx.save();
        {
            // For each unit,
            ctx.scale(zoomedCanvas.height, zoomedCanvas.height);
            ctx.scale(gameViewport.width / zoomedViewport.width, gameViewport.height / zoomedViewport.height);
            ctx.translate(-zoomedViewport.x0, -zoomedViewport.y0);
            ctx.fillStyle = 'rgb(0,255,0)';
            $(this.units).each(function(_, u) {
                    // draw the sprite!
                    var ori_to_dir = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
                    var dir = ori_to_dir[u.ori];
                    ctx.drawImage($('.sprite.' + dir + '.' + u.frame)[0], u.p.x - 0.1, u.p.y - 0.1, 0.1, 0.1);
                });
        }
        ctx.restore();
    }
};
