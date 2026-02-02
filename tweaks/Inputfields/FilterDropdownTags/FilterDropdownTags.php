<?php

namespace RockAdminTweaks;

use ProcessWire\HookEvent;

class FilterDropdownTags extends Tweak
{
  public function info(): array
  {
    return [
      'description' => 'Hide fields/templates which have hidden tags from dropdowns',
    ];
  }

  public function init(): void
  {
    if (!$this->wire->user->isSuperuser()) return;

    $this->addHook('ProcessField::executeNavJSON', $this, 'filterFields');
    $this->addHook('ProcessTemplate::executeNavJSON', $this, 'filterTemplates');
  }

  public function filterFields(HookEvent $event)
  {
    $event->return = $this->filterNavJSONByTags($event, $this->wire->fields);
  }

  public function filterTemplates(HookEvent $event)
  {
    $event->return = $this->filterNavJSONByTags($event, $this->wire->templates);
  }

  /**
   * Helper method for the actual filtering logic
   *
   * @param HookEvent $event The HookEvent from executeNavJSON
   * @param object $collection The PW collection (fields or templates)
   * @return string The manipulated JSON
   */
  protected function filterNavJSONByTags(HookEvent $event, $collection)
  {
    $json = \ProcessWire\wireDecodeJSON($event->return);
    $items = [];
    $collapsedTags = $this->wire->modules->getConfig($event->object, 'collapsedTags') ?: [];

    foreach ($json['list'] as $item) {
      $obj = $collection->get($item['label']);
      if (!$obj || !$obj->id) continue;

      $tags = $obj->getTags();

      // Filter tags that should not be hidden
      $visibleTags = array_filter($tags, function ($tag) use ($collapsedTags) {
        return !in_array($tag, $collapsedTags);
      });

      // Keep item if: no tags exist OR at least one visible tag exists
      if (empty($tags) || count($visibleTags)) {
        $items[] = $item;
      }
    }

    $json['list'] = $items;
    return \ProcessWire\wireEncodeJSON($json);
  }
}
