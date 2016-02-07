<?php
namespace Web\Controller;

use Ranyuen\Little\Exception\NotFound;

class ApiVerticalLatinShareImageController
{
    /**
     * @Route('/api/vertical_latin_share_image')
     */
    public function image($d)
    {
        if (!preg_match('#data:image/png;base64,(.+)\.png#', $d, $matches)) {
            throw new NotFound();
        }
        header('Content-Type: image/png');
        $content = base64_decode($matches[1]);
        header('Content-Length: '.strlen($content));
        echo $content;
    }
}
