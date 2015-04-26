<?php
namespace Web\Controller;

use Ranyuen\Little\Exception\NotFound;
use Ranyuen\Little\Exception\UnprocessableEntity;

class ApiFeedController
{
    /**
     * @Route('/api/feed')
     */
    public function fetch($url, $count = 7) {
        $count = (int) $count;
        if (filter_var($url, FILTER_VALIDATE_URL) === false || !preg_match('#\Ahttps?://#', $url)) {
            throw new UnprocessableEntity();
        }
        $feed = file_get_contents($url);
        if (!$feed) {
            throw new NotFound();
        }
        $feed    = simplexml_load_string($feed);
        $title   = (string) $feed->title;
        $entries = [];
        $i       = 1;
        foreach ($feed->entry as $entry) {
            $entries[] = [
                'title'     => (string) $entry->title,
                'link'      => (string) $entry->link->attributes()['href'],
                'summary'   => (string) $entry->summary,
                'published' => (string) ($entry->published ?: $entry->issued),
                'updated'   => (string) ($entry->updated ?: $entry->modified),
            ];
            ++$i;
            if ($i > $count) {
                break;
            }
        }
        return json_encode([
            'title'   => $title,
            'entries' => $entries,
        ]);
    }
}
