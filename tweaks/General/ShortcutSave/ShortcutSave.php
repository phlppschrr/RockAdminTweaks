<?php

namespace RockAdminTweaks;

class ShortcutSave extends Tweak
{
  public function info(): array
  {
    return [
      'description' => 'Enables CTRL+S shortcut for saving pages',
    ];
  }

  public function init(): void
  {
    if ($this->wire->page->template != 'admin') return;
    $this->loadJS();
  }
}
