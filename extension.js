/*
  License: GPL v3
*/

const Main = imports.ui.main;
const Dash = imports.ui.dash.Dash;
const Layout = imports.ui.layout;
const Shell = imports.gi.Shell;
const Meta = imports.gi.Meta;
const St = imports.gi.St;
const GLib = imports.gi.GLib;

const setTimeout = (func, delay, ...args) => {
    const wrappedFunc = () => {
        func.apply(this, args);
    };
    return GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, wrappedFunc);
}

const setInterval = (func, delay, ...args) => {
    const wrappedFunc = () => {
        return func.apply(this, args) || true;
    };
    return GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, wrappedFunc);
}

class Extension {
    constructor() {
        this.vertical = false;
        this.shrink = true;
        this.recycleOldDash = false;
    }

    layout() {
        let [sw, sh] = global.display.get_size();

        this.dockWidth = 80;
        this.dockHeight = 80;

        if (this.shrink) {
            this.dash.add_style_class_name('shrink');
        } else {
            this.dash.remove_style_class_name('shrink');
        }

        if (this.vertical) {
            this.dashContainer.set_position(0, 0);
            this.dash.last_child.vertical = true;
            this.dash.last_child.first_child.layout_manager.orientation = 1;
            this.dashContainer.set_height(sh);
        } else {
            this.dashContainer.set_position(0, sh - this.dockHeight - (this.shrink ? 0 : 12));
            this.dashContainer.set_width(sw);
            this.dashContainer.set_height(this.dockHeight);
        }

        if (this.recycleOldDash) {
            Main.uiGroup.find_child_by_name('overview').first_child.remove_child(this.dash);
        }
        this.dashContainer.add_child(this.dash);
    }

    enable() {

        if (this.recycleOldDash) {
        	this.originalDash = Main.uiGroup.find_child_by_name('dash');
            this.dash = this.originalDash;
        } else {
            this.dash = new Dash();
            this.dash.set_name('dash');
            this.dash.add_style_class_name('overview');
        }

        this.dashContainer = new St.BoxLayout({ name: 'dashContainer',
                                           vertical: true });

        Main.layoutManager.addChrome(
            this.dashContainer,
            {   affectsStruts: true,
                trackFullscreen: true
            });

        // global.display.connect('in-fullscreen-changed', (() => {
        //     let primary = Main.layoutManager.primaryMonitor;
        //     this.dash.visible = !primary.inFullscreen;
        // }).bind(this));

        Main.overview.connect('showing', () => {
            this.dashContainer.height = 0;
        });

        Main.overview.connect('hidden', () => {
            this.dashContainer.height = this.dockHeight;
        });

        Main.overview.dash.height = 0;
        Main.overview.dash.hide();

        this.layout();
    }

    disable() {
        Main.layoutManager.removeChrome(this.dashContainer);
        delete this.dashContainer;

        Main.overview.dash.height = -1;
        Main.overview.dash.show();
    }
}

function init() {
	return new Extension();
}



// animation tests

// this.dash.set_reactive(true);

/*
this.dash.set_track_hover(true);


let defaultSz = 1;
this.dash.connect('motion-event', (actor, event, motion) => {
    let pointer = global.get_pointer();
    pointer[0] -= MyDash.last_child.x;
    pointer[1] -= MyDash.y;

    MyDash.last_child.first_child.get_children().forEach(c => { 
        let pos = c.position;
        let dx = (pos.x + c.width/2 - pointer[0]);
        let dy = (pos.y + c.height/2 - pointer[1]);
        let d = Math.sqrt(dx * dx); //  + dy * dy;

        let szTarget = c.first_child.first_child;
        if (d < 200) {
            let sz = defaultSz + (1 - (d / 200));
            // c.add_style_class_name('hi');
            // szTarget.scale_x = sz;
            // szTarget.scale_y = sz;
            // szTarget.margin_bottom = sz * 40;
            szTarget.margin_left = sz * 20;
        } else {
            // szTarget.scale_x = defaultSz;
            // szTarget.scale_y = defaultSz;
        }
    });

});

this.dash.connect('leave-event', () => {
    MyDash.last_child.first_child.get_children().forEach(c => { 
        // c.remove_style_class_name('hi');
        let szTarget = c.first_child.first_child;
        szTarget.margin_left = 0;
        // szTarget.scale_x = defaultSz;
        // szTarget.scale_y = defaultSz;
        // szTarget.margin_bottom = 0;
    })
});
*/