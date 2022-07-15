const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;

const sources = {
    "netflix": {"source": "Netflix", "icon": "mdi:netflix"},
    "spotify": {"source": "Spotify", "icon": "mdi:spotify"},
    "youtube": {"source": "YouTube", "icon": "mdi:youtube"},
};

var fireEvent = function(node, type, detail, options) {
    options = options || {};
    detail = detail === null || detail === undefined ? {} : detail;
    var event = new Event(type, {
        bubbles: false,
    });
    event.detail = detail;
    node.dispatchEvent(event);
    return event;
};

class TVCardServices extends LitElement {
    constructor() {
        super();

        this.custom_keys = {};
        this.custom_sources = {};
        this.custom_icons = {};

        this.holdtimer = null;
        this.holdaction = null;
        this.holdinterval = null;
        this.timer = null;
    }

    static get properties() {
        return {
            _hass: {},
            _config: {},
            _apps: {},
            trigger: {},
        };
    }

    static getStubConfig() {
        return {};
    }

    getCardSize() {
        return 7;
    }

    setConfig(config) {
        if (!config.entity) {
            console.log("Invalid configuration");
            return;
        }
        this._config = { theme: "default", ...config };
        switch(config.platform) {
            case "androidtv": {
                this.keys = {
                    "power": {"key": "POWER", "icon": "mdi:power"},
                    "volume_up": {"key": "VOLUME_UP", "icon": "mdi:volume-plus"},
                    "volume_down": {"key": "VOLUME_DOWN", "icon": "mdi:volume-minus"},
                    "volume_mute": {"key": "MUTE", "icon": "mdi:volume-mute"},
                    "return": {"key": "BACK", "icon": "mdi:arrow-left"},
                    "home": {"key": "HOME", "icon": "mdi:home"},
                    "up": {"key": "UP", "icon": "mdi:chevron-up"},
                    "left": {"key": "LEFT", "icon": "mdi:chevron-left"},
                    "enter": {"key": "CENTER", "icon": "mdi:checkbox-blank-circle"},
                    "right": {"key": "RIGHT", "icon": "mdi:chevron-right"},
                    "down": {"key": "DOWN", "icon": "mdi:chevron-down"},
                    "rewind": {"key": "REWIND", "icon": "mdi:rewind"},
                    "play": {"key": "RESUME", "icon": "mdi:play"},
                    "fast_forward": {"key": "FAST_FORWARD", "icon": "mdi:fast-forward"},
                    "menu": {"key": "MENU", "icon": "mdi:menu"},
                    "settings": {"key": "SETTINGS", "icon": "mdi:cog"},
                };
                break;
            }
            case "webostv": {
                this.keys = {
                    "volume_up": {"key": "VOLUMEUP", "icon": "mdi:volume-plus"},
                    "volume_down": {"key": "VOLUMEDOWN", "icon": "mdi:volume-minus"},
                    "volume_mute": {"key": "MUTE", "icon": "mdi:volume-mute"},
                    "return": {"key": "BACK", "icon": "mdi:arrow-left"},
                    "info": {"key": "INFO", "icon": "mdi:information"},
                    "home": {"key": "HOME", "icon": "mdi:home"},
                    "channel_up": {"key": "CHANNELUP", "icon": "mdi:arrow-up"},
                    "channel_down": {"key": "CHANNELDOWN", "icon": "mdi:arrow-down"},
                    "up": {"key": "UP", "icon": "mdi:chevron-up"},
                    "left": {"key": "LEFT", "icon": "mdi:chevron-left"},
                    "enter": {"key": "ENTER", "icon": "mdi:checkbox-blank-circle"},
                    "right": {"key": "RIGHT", "icon": "mdi:chevron-right"},
                    "down": {"key": "DOWN", "icon": "mdi:chevron-down"},
                    "play": {"key": "PLAY", "icon": "mdi:play"},
                    "pause": {"key": "PAUSE", "icon": "mdi:pause"},
                    "menu": {"key": "MENU", "icon": "mdi:menu"},
                    "guide": {"key": "GUIDE", "icon": "mdi:television-guide"},
                    "exit": {"key": "EXIT", "icon": "mdi:close"},
                };
                break;
            }
            case "roku": {
                let remote_entity = !config.remote_entity ? "remote." + config.entity.split(".")[1] : config.remote_entity;
                this.keys = {
                    "power": {"icon": "mdi:power", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "power"}},
                    "volume_up": {"icon": "mdi:volume-plus", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "volume_up"}},
                    "volume_down": {"icon": "mdi:volume-minus", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "volume_down"}},
                    "volume_mute": {"icon": "mdi:volume-mute", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "volume_mute"}},
                    "return": {"icon": "mdi:arrow-left", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "back"}},
                    "info": {"icon": "mdi:asterisk", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "info"}},
                    "home": {"icon": "mdi:home", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "home"}},
                    "channel_up": {"icon": "mdi:arrow-up", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "channel_up"}},
                    "channel_down": {"icon": "mdi:arrow-down", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "channel_down"}},
                    "up": {"icon": "mdi:chevron-up", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "up"}},
                    "left": {"icon": "mdi:chevron-left", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "left"}},
                    "enter": {"icon": "mdi:checkbox-blank-circle", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "select"}},
                    "right": {"icon": "mdi:chevron-right", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "right"}},
                    "down": {"icon": "mdi:chevron-down", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "down"}},
                    "rewind": {"icon": "mdi:rewind", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "reverse"}},
                    "play": {"icon": "mdi:play-pause", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "play"}},
                    "fast_forward": {"icon": "mdi:fast-forward", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "forward"}},
                };
                break;
            }
            case "samsungtv":
            default: {
                this.keys = {
                    "power": {"key": "KEY_POWER", "icon": "mdi:power"},
                    "volume_up": {"key": "KEY_VOLUP", "icon": "mdi:volume-plus"},
                    "volume_down": {"key": "KEY_VOLDOWN", "icon": "mdi:volume-minus"},
                    "volume_mute": {"key": "KEY_MUTE", "icon": "mdi:volume-mute"},
                    "return": {"key": "KEY_RETURN", "icon": "mdi:arrow-left"},
                    "source": {"key": "KEY_SOURCE", "icon": "mdi:video-input-hdmi"},
                    "info": {"key": "KEY_INFO", "icon": "mdi:television-guide"},
                    "home": {"key": "KEY_HOME", "icon": "mdi:home"},
                    "channel_up": {"key": "KEY_CHUP", "icon": "mdi:arrow-up"},
                    "channel_down": {"key": "KEY_CHDOWN", "icon": "mdi:arrow-down"},
                    "up": {"key": "KEY_UP", "icon": "mdi:chevron-up"},
                    "left": {"key": "KEY_LEFT", "icon": "mdi:chevron-left"},
                    "enter": {"key": "KEY_ENTER", "icon": "mdi:checkbox-blank-circle"},
                    "right": {"key": "KEY_RIGHT", "icon": "mdi:chevron-right"},
                    "down": {"key": "KEY_DOWN", "icon": "mdi:chevron-down"},
                    "rewind": {"key": "KEY_REWIND", "icon": "mdi:rewind"},
                    "play": {"key": "KEY_PLAY", "icon": "mdi:play"},
                    "pause": {"key": "KEY_PAUSE", "icon": "mdi:pause"},
                    "fast_forward": {"key": "KEY_FF", "icon": "mdi:fast-forward"},
                };
            }
        }

        this.custom_keys = config.custom_keys || {};
        this.custom_sources = config.custom_sources || {};
        this.custom_icons = config.custom_icons || {};
        
        this.loadCardHelpers();
        this.renderVolumeSlider();
    }
    isButtonEnabled(row, button) {
        if (!(this._config[row] instanceof Array)) return false;

        return this._config[row].includes(button);
    }

    set hass(hass) {
        this._hass = hass;
        if (this.volume_slider) this.volume_slider.hass = hass;
        if (this._hassResolve) this._hassResolve();
    }

    get hass() {
        return this._hass;
    }

    async loadCardHelpers() {
        this._helpers = await (window).loadCardHelpers();
        if (this._helpersResolve) this._helpersResolve();
    }

    async renderVolumeSlider() {
        if (this._helpers === undefined)
            await new Promise((resolve) => (this._helpersResolve = resolve));
        if (this._hass === undefined)
            await new Promise((resolve) => (this._hassResolve = resolve));
        this._helpersResolve = undefined;
        this._hassResolve = undefined;

        let volume_entity = (this._config.volume_entity === undefined) ? this._config.entity : this._config.volume_entity;
        let slider_config = {
            "type": "custom:my-slider",
            "entity": volume_entity,
            "height": "50px",
            "mainSliderColor": "white",
            "secondarySliderColor": "rgb(60, 60, 60)",
            "mainSliderColorOff": "rgb(60, 60, 60)",
            "secondarySliderColorOff": "rgb(60, 60, 60)",
            "thumbWidth": "0px",
            "thumbHorizontalPadding": "0px",
            "radius": "25px",
        };

        if (this._config.slider_config instanceof Object) {
            slider_config = {...slider_config, ...this._config.slider_config };
        }

        this.volume_slider = await this._helpers.createCardElement(slider_config);
        this.volume_slider.style = "flex: 0.9;";
        this.volume_slider.ontouchstart = (e) => {
            e.stopImmediatePropagation();
            if (this._config.enable_button_feedback === undefined || this._config.enable_button_feedback) fireEvent(window, "haptic", "light");
        };
        this.volume_slider.addEventListener("input", (e) => {
            if (this._config.enable_slider_feedback === undefined || this._config.enable_slider_feedback) fireEvent(window, "haptic", "light");
        }, true);

        this.volume_slider.hass = this._hass;
        this.triggerRender();
    }

    sendKey(key) {
        let entity_id = this._config.entity;
        if (this._config.platform === "androidtv") {
            this._hass.callService("androidtv", "adb_command", {
                command: key
            }, { entity_id: entity_id });
        }
        else if (this._config.platform === "webostv") {
            this._hass.callService("webostv", "button", {
                button: key
            }, { entity_id: entity_id });
        }
        else {
            this._hass.callService("media_player", "play_media", {
                media_content_id: key,
                media_content_type: "send_key",
            }, { entity_id: entity_id });
        }
    }

    changeSource(source) {
        let entity_id = this._config.entity;

        // supported by androidtv, samsungtv (i'm not sure about webostv)
        this._hass.callService("media_player", "select_source", {
            source: source,
            entity_id: entity_id,
        });
    }

    onClick(event) {
        event.stopImmediatePropagation();
        let click_action = () => {
            this.sendKey(this.keys.enter.key);
            if (this._config.enable_button_feedback === undefined || this._config.enable_button_feedback) fireEvent(window, "haptic", "light");
        };  
        if (this._config.enable_double_click) {
            this.timer = setTimeout(click_action, 200);
        } else {
            click_action();
        }
    }

    onDoubleClick(event) {
        if (this._config.enable_double_click !== undefined && !this._config.enable_double_click) return;

        event.stopImmediatePropagation();

        clearTimeout(this.timer);
        this.timer = null;

        this.sendKey(this._config.double_click_keycode ? this._config.double_click_keycode : this.keys.return.key);
        if (this._config.enable_button_feedback === undefined || this._config.enable_button_feedback) fireEvent(window, "haptic", "success");
    }

    onTouchStart(event) {
        event.stopImmediatePropagation();

        this.holdaction = this.keys.enter.key;
        this.holdtimer = setTimeout(() => {

            //hold
            this.holdinterval = setInterval(() => {
                this.sendKey(this.holdaction);
                if (this._config.enable_button_feedback === undefined || this._config.enable_button_feedback) fireEvent(window, "haptic", "light");
            }, 200);
        }, 700);
        window.initialX = event.touches[0].clientX;
        window.initialY = event.touches[0].clientY;
    }

    onTouchEnd(event) {
        clearTimeout(this.timer);
        clearTimeout(this.holdtimer);
        clearInterval(this.holdinterval);

        this.holdtimer = null;
        this.timer = null;
        this.holdinterval = null;
        this.holdaction = null;
    }

    onTouchMove(event) {
        if (!initialX || !initialY) {
            return;
        }

        var currentX = event.touches[0].clientX;
        var currentY = event.touches[0].clientY;

        var diffX = initialX - currentX;
        var diffY = initialY - currentY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            // sliding horizontally

            let key = diffX > 0 ? this.keys.left.key : this.keys.right.key;
            this.holdaction = key;
            this.sendKey(key);
        } else {
            // sliding vertically
            let key = diffY > 0 ? this.keys.up.key : this.keys.down.key;
            this.holdaction = key;

            this.sendKey(key);
        }

        if (this._config.enable_button_feedback === undefined || this._config.enable_button_feedback) fireEvent(window, "haptic", "selection");
        initialX = null;
        initialY = null;
    }

    handleActionClick(e) {
        let action = e.currentTarget.action;

        let info = this.custom_keys[action] || this.custom_sources[action] || this.keys[action] || sources[action];

        if (info.key) {
            this.sendKey(info.key);
        }
        else if (info.source) {
            this.changeSource(info.source);
        }
        else if (info.service) {
            const [domain, service] = info.service.split(".", 2);
            this._hass.callService(domain, service, info.service_data);
        }

        if (this._config.enable_button_feedback === undefined || this._config.enable_button_feedback) fireEvent(window, "haptic", "light");
    }

    buildIconButton(action) {
        let button_info = this.custom_keys[action] || this.custom_sources[action] || this.keys[action] || sources[action] || {};

        let icon = button_info.icon;
        let custom_svg_path = this.custom_icons[icon];

        return html`
            <ha-icon-button
                .action="${action}"
                @click="${this.handleActionClick}"
                title="${action}"
                .path="${custom_svg_path ? custom_svg_path : ""}"
                >
                <ha-icon
                    .icon="${!custom_svg_path? icon : ""}"
                </ha-icon>
            </ha-icon-button>
        `;
    }
    
    buildRow(content) {
        return html `
            <div class="row">
                ${content}
            </div>
        `;
    }
    buildButtonsFromActions(actions) {
        return actions.map((action) => this.buildIconButton(action));
    }

    triggerRender() {
        this.trigger = Math.random();
    }
    
    render() {
        if (!this._config || !this._hass || !this.volume_slider) {
            return html ``;
        }

        const row_names = ["power_row", "channel_row", "apps_row", "source_row", "volume_row", "media_control_row", "navigation_row"];

        var content = [];
        Object.keys(this._config).forEach((row_name) => {
            if (row_names.includes(row_name)) {
                let row_actions = this._config[row_name];

                if (row_name === "volume_row") {
                    let volume_row = [];
                    if (this._config.volume_row == "buttons") {
                        volume_row = [
                            this.buildIconButton("volume_down"),
                            this.buildIconButton("volume_mute"),
                            this.buildIconButton("volume_up")
                        ];
                    } else if (this._config.volume_row == "slider") {
                        volume_row = [this.volume_slider];
                    }
                    content.push(volume_row);
                } else if (row_name === "navigation_row") {
                    let navigation_row = [];

                    if (this._config.navigation_row == "buttons") {
                        let up_row = [this.buildIconButton("up")];
                        let middle_row = [this.buildIconButton("left"), this.buildIconButton("enter"), this.buildIconButton("right")];
                        let down_row = [this.buildIconButton("down")];
                        navigation_row = [up_row, middle_row, down_row];
                    } else if (this._config.navigation_row == "touchpad") {
                        var touchpad = [html `
                            <toucharea
                                id="toucharea"
                                @click="${this.onClick}"
                                @dblclick="${this.onDoubleClick}"
                                @touchstart="${this.onTouchStart}"
                                @touchmove="${this.onTouchMove}"
                                @touchend="${this.onTouchEnd}">
                            </toucharea>
                        `];
                        navigation_row = [touchpad];
                    }
                    content.push(...navigation_row);
                } else {
                    let row_content = this.buildButtonsFromActions(row_actions);
                    content.push(row_content);
                }
            }
        });

        content = content.map(this.buildRow);

        var output = html `
            ${this.renderStyle()}
            <ha-card .header="${this._config.title}">${content}</ha-card>
        `;

        return html `${output}`;
    }

    renderStyle() {
        return html `
            <style>
                .remote {
                    padding: 16px 0px 16px 0px;
                }
                img,
                ha-icon-button {
                    width: 64px;
                    height: 64px;
                    cursor: pointer;
                    --mdc-icon-size: 100%;
                }
                .row {
                    display: flex;
                    padding: 8px 36px 8px 36px;
                    justify-content: space-evenly;
                }
                .diagonal {
                    background-color: var(--light-primary-color);
                }
                toucharea {
                    border-radius: 30px;
                    flex-grow: 1;
                    height: 250px;
                    background: #6d767e;
                    touch-action: none;
                    text-align: center;
                }
            </style>
        `;
    }

    applyThemesOnElement(element, themes, localTheme) {
        if (!element._themes) {
            element._themes = {};
        }
        let themeName = themes.default_theme;
        if (localTheme === "default" || (localTheme && themes.themes[localTheme])) {
            themeName = localTheme;
        }
        const styles = Object.assign({}, element._themes);
        if (themeName !== "default") {
            var theme = themes.themes[themeName];
            Object.keys(theme).forEach((key) => {
                var prefixedKey = "--" + key;
                element._themes[prefixedKey] = "";
                styles[prefixedKey] = theme[key];
            });
        }
        if (element.updateStyles) {
            element.updateStyles(styles);
        } else if (window.ShadyCSS) {
            // implement updateStyles() method of Polemer elements
            window.ShadyCSS.styleSubtree(
                /** @type {!HTMLElement} */
                (element),
                styles
            );
        }

        const meta = document.querySelector("meta[name=theme-color]");
        if (meta) {
            if (!meta.hasAttribute("default-content")) {
                meta.setAttribute("default-content", meta.getAttribute("content"));
            }
            const themeColor =
                styles["--primary-color"] || meta.getAttribute("default-content");
            meta.setAttribute("content", themeColor);
        }
    }
}

customElements.define("tv-card", TVCardServices);