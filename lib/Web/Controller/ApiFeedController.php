<?php
namespace Web\Controller;

use Ranyuen\Little\Exception\NotFound;

class ApiFeedController
{
    /**
     * @Route('/api/feed')
     */
    function fetch($url, $count = 7) {
        $feed = file_get_contents('http://c4se.hatenablog.com/feed');
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
                'published' => (string) $entry->published,
                'updated'   => (string) $entry->updated,
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
