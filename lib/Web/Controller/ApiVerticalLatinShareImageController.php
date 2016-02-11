<?php
namespace Web\Controller;

use Aws\S3\S3Client;
use Ranyuen\Little\Exception\Found;
use Ranyuen\Little\Exception\NotFound;
use Ranyuen\Little\Exception\UnprocessableEntity;

class ApiVerticalLatinShareImageController
{
    public function __construct()
    {
        $this->s3 = new S3Client([
            'credentials' => [
                'key'    => $_ENV['AWS_VERTICAL_LATIN_SHARE_IMAGE_ACCESS_KEY_ID'],
                'secret' => $_ENV['AWS_VERTICAL_LATIN_SHARE_IMAGE_SECRET_ACCESS_KEY'],
            ],
            'region'      => 'ap-northeast-1',
            'version'     => 'latest',
        ]);
    }

    /**
     * @Route('/api/vertical_latin_share_image.png')
     */
    public function show($text)
    {
        $text = rawurldecode($text);
        if (strlen($text) > 140) {
            throw new UnprocessableEntity();
        }
        throw new Found('https://s3-ap-northeast-1.amazonaws.com/vertical-latin-share-image/'.rawurlencode($text).'.png');
    }

    /**
     * @Route('/api/vertical_latin_share_image.png',via=POST)
     */
    public function create($text, $image)
    {
        $text = rawurldecode($text);
        if (strlen($text) > 140) {
            throw new UnprocessableEntity();
        }
        if (!preg_match('#data:image/png;base64,(.+)#', $image, $matches) || strlen($matches[1]) > 50000) {
            throw new UnprocessableEntity();
        }
        $this->s3->putObject([
            'ACL'         => 'public-read',
            'Body'        => base64_decode($matches[1]),
            'Bucket'      => 'vertical-latin-share-image',
            'ContentType' => 'image/png',
            'Key'         => "$text.png",
        ]);
        echo json_encode(['ok' => true]);
    }
}
