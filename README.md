# TV Remote Card (with touchpad and haptic feedback)

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE.md)
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)
![Project Maintenance][maintenance-shield]
[![GitHub Activity][last-commit-shield]][commits]
[![Community Forum][forum-shield]][forum]

[![Github][github]][github]

📦 This repo is a fork of [tv-card](https://github.com/marrobHD/tv-card) and includes a bunch of new features and improvements, like:

- Fully functional touchpad for navigation (thanks to [iablon's Touchpad Card](https://github.com/iablon/HomeAssistant-Touchpad-Card)) ❤️
- Slider for volume (thanks to [AnthonMS's Slider Card](https://github.com/AnthonMS/my-cards#slider-card)) ❤️
- Supports [ollo69's SamsungTV Smart Component](https://github.com/ollo69/ha-samsungtv-smart)
- Supports [LG webOS Smart TV](https://www.home-assistant.io/integrations/webostv/)
- Supports [Android TV](https://www.home-assistant.io/integrations/androidtv/)
- Supports [Sony Bravia TV](https://www.home-assistant.io/integrations/braviatv)
- Much easier setup
- Implements haptics feedback
- Customizable layout, you can choose the order of the rows and buttons
- All rows and buttons are optional, you can change whatever you *(don't)* like

## Demo

<img src="assets/screenshot.png" alt="ex" width="300"/>

## Options

| Name | Type | Requirement | Default |Description
| ---- | ---- | ------- | ---- | -----------
| type | string | **Required** | | `custom:tv-card`
| entity | string | **Required** | | The `media_player` entity to control.
| platform | string | **Optional** | `samsungtv` | Platform of `media_player`. Supported values: `samsungtv`, `androidtv`, `webostv`, `roku`, `braviatv`
| remote_entity | string | **Optional** | `remote.{{entity_id}}` | The remote entity that controls the Roku and Bravia `media_player`
| volume_entity | string | **Optional** | `entity` | The `media_player` entity for volume control (working only with volume_row: `slider`)
| title | string | **Optional** | | Card title for showing as header.
| rows | object | **Optional** | | Button rows
| enable_double_click | boolean | **Optional** | `true` | Whether a double click on the touchpad should send the key in `double_click_action`
| double_click_action | string | **Optional** | `return` | The action for double clicks on the touchpad. Defaults to `return`
| enable_button_feedback | boolean | **Optional** | `true` | Shall clicks on the buttons return a vibration feedback?
| enable_slider_feedback | boolean | **Optional** | `true` | Shall the volume slider return a vibration feedback when you slide through it?
| slider_config | object | **Optional** | | Custom configuration for the volume slider. See [slider-card](https://github.com/AnthonMS/my-cards)
| custom_keys | object | **Optional** | | Custom keys for the remote control. Each item is an object that should have `icon` and at least one of the following properties: `key`, `source`, `service`.
| custom_sources | object | **Optional** | | Custom sources for the remote control. Same object as above, but letting you split keys and sources.

Using only these options you will get an empty card (or almost empty, if you set a title).
In order to include the buttons, you need to specify in the config the rows you want and which buttons you want in it.
You do it by declaring the rows as arrays and its buttons as values, like this:

```yaml
rows:
  power_row:
    - power
  media_control_row:
    - rewind
    - play
    - pause
    - fast_forward
  volume_row: slider
  numpad_row: true
  navigation_row: touchpad
```

The preset rows are `volume_row`, `numpad_row` and `navigation_row`, which requires a string or boolean as value.

| Name | Type | Description
| ---- | ---- | -------
| volume_row | string | Can be either `slider` or `buttons`. This defines the mode you want for setting the volume (you'll see them soon below). You need to have [slider-card](https://github.com/AnthonMS/my-cards) installed in order to use `slider`.
| numpad_row | boolean | If `true`, numpad row will show.
| navigation_row | string | Can be either `touchpad` or `buttons`. This defines the mode you want for navigating around your tv (you'll also see them soon below).

## **Notice**

This card supports `androidtv`, `webostv`, `roku`, `braviatv` and `samsungtv` out of the box. If your TV is from another brand you can use this card by setting [custom buttons](#custom-buttons) with services to send keys to your TV (or do whatever you want) in your way.
If you have time and wanna help, you can add new integrations to this card. Check [this PR](https://github.com/usernein/tv-card/pull/8).

Platform `webostv` doesn't support power key (see [webOS Integration](https://www.home-assistant.io/integrations/webostv/#turn-on-action))

## Custom buttons

If you want to add custom buttons to the remote control (of if you want to reconfigure the existing buttons), you can do it by adding an object to the `custom_keys` option:

```yaml
custom_keys:
  input_tv:
    icon: mdi:television-box
    key: KEY_TV
  browser:
    icon: mdi:web
    source: browser
  toggle_light:
    icon: mdi:lightbulb
    service: light.toggle
    service_data:
      entity_id: light.bedroom
```

The `custom_sources` exists for the same purpose, but you can use it to split the keys and sources.

```yaml
custom_keys:
  input_tv:
    icon: mdi:television-box
    key: KEY_TV
  toggle_light:
    icon: mdi:lightbulb
    service: light.toggle
    service_data:
      entity_id: light.bedroom
custom_sources:
  browser:
    icon: mdi:web
    source: browser
```

Then you can easily use these buttons in your card:

```yaml
rows:
  power_row:
    - browser
    - power
    - input_tv
  media_control_row:
    - rewind
    - play
    - pause
    - fast_forward
    - toggle_light
```

<img src="assets/custom_keys.png" alt="guide" width="300"/>

With custom buttons you can override existing buttons for changing its icon or even its functionality. Here i do both:

```yaml
custom_keys:
  power:
    icon: mdi:power-cycle
    service: media_player.toggle
    service_data:
      entity_id: media_player.tv
```

Inside each button you may define `icon` and either `key`, `source` or `service`, as you've seen.

| Option | internal function | Description
| ---- | ---- | -------
| icon |  | The icon to show in the button. If empty, the button will be blank.
| key | `media_player.play_media(media_content_id=key, media_content_type="send_key")` | The key to send to the TV via `media_player.play_media`
| source | `media_player.select_source(source=source)` | The source to switch to via `media_player.select_source`
| service | `_hass.callService(domain, service, service_data)` | A string representing service to call. Use the format `domain.service`, e.g. `"light.turn_on"`
| service_data | passed with `service` | The data to pass to the service. May be an object depending on the service you are using.

## Custom icons

You can customize any icon with a custom svg path using the `custom_icons` option.

Usage:

```yaml
custom_icons:
  <button>: <svg_path>
```

Example:

```yaml
custom_icons:
  hbo: >-
    M7.042 16.896H4.414v-3.754H2.708v3.754H.01L0
    7.22h2.708v3.6h1.706v-3.6h2.628zm12.043.046C21.795 16.94 24 14.689 24
    11.978a4.89 4.89 0 0 0-4.915-4.92c-2.707-.002-4.09 1.991-4.432
    2.795.003-1.207-1.187-2.632-2.58-2.634H7.59v9.674l4.181.001c1.686 0
    2.886-1.46 2.888-2.713.385.788 1.72 2.762 4.427 2.76zm-7.665-3.936c.387 0
    .692.382.692.817 0 .435-.305.817-.692.817h-1.33v-1.634zm.005-3.633c.387 0
    .692.382.692.817 0 .436-.305.818-.692.818h-1.33V9.373zm1.77
    2.607c.305-.039.813-.387.992-.61-.063.276-.068 1.074.006
    1.35-.204-.314-.688-.701-.998-.74zm3.43 0a2.462 2.462 0 1 1 4.924 0 2.462
    2.462 0 0 1-4.925 0zm2.462 1.936a1.936 1.936 0 1 0 0-3.872 1.936 1.936 0 0 0
    0 3.872Z
```

The svg path was copied from [SimpleIcon](https://simpleicons.org/?q=hbo). Although you can use [this integration](https://github.com/vigonotion/hass-simpleicons) for using icons from SimpleIcons (there's also one for [fontawesome](https://github.com/thomasloven/hass-fontawesome)).

Having defined the custom icon, you can use it on any custom button:

```yaml
custom_sources:
  hbomax:
    icon: hbo
    source: HBO Max
```

## Installation

### Step 1

Install using HACS or [see this guide](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins).

### Step 2

Add a custom element in your `ui-lovelace.yaml`

```yaml
      - type: custom:tv-card
        entity: media_player.tv
        rows:
          power_row:
            - power
          channel_row:
            - channel_up
            - info
            - channel_down
          apps_row:
            - netflix
            - youtube
            - spotify
          volume_row: slider
          navigation_row: touchpad
          source_row:
            - return
            - home
            - source
          media_control_row:
            - rewind
            - play
            - pause
            - fast_forward
```

### Example 1

Playing with order, moving and repeating buttons:

```yaml
type: custom:tv-card
entity: media_player.tv
platform: samsungtv
title: Example 1
rows:
  power_row:
    - power
  source_row:
    - return
    - home
    - source
    - netflix
  apps_row:
    - youtube
    - spotify
    - netflix
  navigation_row: touchpad
  volume_row: slider
  channel_row:
    - channel_up
    - channel_down
    - info
  media_control_row:
    - rewind
    - play
    - spotify
    - pause
    - fast_forward
```

Result:

<img src="assets/disorder.png" alt="disorder example" width="300"/>

### Example 2

Buttons, buttons everywhere!

```yaml
type: custom:tv-card
entity: media_player.tv
platform: samsungtv
title: Example 2
rows:
  power_row:
    - power
  channel_row:
    - channel_up
    - info
    - channel_down
  apps_row:
    - netflix
    - youtube
    - spotify
  volume_row: buttons
  navigation_row: buttons
  source_row:
    - return
    - home
    - source
  media_control_row:
    - rewind
    - play
    - pause
    - fast_forward
```

Result:

<img src="assets/buttons_everywhere.png" alt="buttons example" width="300"/>

### Example 3

Using less

```yaml
type: custom:tv-card
entity: media_player.tv
platform: samsungtv
title: Example 3
rows:
  power_row:
    - power
  apps_row:
    - netflix
    - youtube
    - spotify
  volume_row: slider
  navigation_row: touchpad
  source_row:
    - return
    - home
```

Result:

<img src="assets/using_less.png" alt="less example" width="300"/>

### Extra

In any row, if you add an ampty item, there will be an empty/invisible button filling the space:

```yaml
rows:
  source_row:
    - return
    - home
    - source
  media_control_row:
    - rewind
    -
    - 
    - fast-forward
```

<img src="assets/empty_buttons.png" alt="empty buttons example" width="300"/>

[last-commit-shield]: https://img.shields.io/github/last-commit/usernein/tv-card?style=for-the-badge
[commits]: https://github.com/usernein/tv-card/commits/master
[forum-shield]: https://img.shields.io/badge/community-forum-brightgreen.svg?style=for-the-badge
[forum]: https://community.home-assistant.io/t/lovelace-an-awesome-modified-tv-card-with-touchpad-and-haptic-feedback/432791
[license-shield]: https://img.shields.io/github/license/usernein/tv-card.svg?style=for-the-badge
[maintenance-shield]: https://img.shields.io/badge/maintainer-usernein-blue.svg?style=for-the-badge
[releases-shield]: https://img.shields.io/github/release/usernein/tv-card.svg?style=for-the-badge
[releases]: https://github.com/usernein/tv-card/releases
[github]: https://img.shields.io/github/followers/usernein.svg?style=social
