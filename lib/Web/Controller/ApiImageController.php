<?php
namespace Web\Controller;

use Ranyuen\Little\Exception\NotFound;

class ApiImageController
{
    /**
     * @Route('/api/image/:path*')
     */
    public function image($path, $w = null, $h = null)
    {
        $path = __DIR__.'/../../assets/'.urldecode($path);
        if (!is_readable($path)) {
            throw new NotFound();
        }
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimetype = finfo_file($finfo, $path);
        finfo_close($finfo);
        header("Content-Type: $mimetype");
        if (is_null($w) && is_null($h)) {
            header('Content-Length: '.filesize($path));
            readfile($path);
            return;
        }
        switch ($mimetype) {
        case 'image/gif':
            $originalImage = imagecreatefromgif($path);
            break;
        case 'image/jpeg':
            $originalImage = imagecreatefromjpeg($path);
            break;
        case 'image/png':
            $originalImage = imagecreatefrompng($path);
            break;
        default:
            throw NotFound();
        }
        list($originalW, $originalH) = getimagesize($path);
        $w = is_null($w) ? null : (int) $w;
        $h = is_null($h) ? null : (int) $h;
        if (is_null($w)) {
            $w = floor($originalW * $h / $originalH);
        } else if (is_null($h)) {
            $h = floor($originalH * $w / $originalW);
        }
        $image = imagecreatetruecolor($w, $h);
        imagecopyresampled($image, $originalImage, 0, 0, 0, 0, $w, $h, $originalW, $originalH);
        imagedestroy($originalImage);
        switch ($mimetype) {
        case 'image/gif':
            imagegif($image);
            break;
        case 'image/jpeg':
            imagejpeg($image, null, 95);
            break;
        case 'image/png':
            imagepng($image, null, 9, PNG_ALL_FILTERS);
            break;
        }
    }
}
