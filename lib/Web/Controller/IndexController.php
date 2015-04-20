<?php
namespace Web\Controller;

use Ranyuen\Little\Exception\NotFound;
use Web\View;

class IndexController
{
    /**
     * @Route('/:path*?')
     */
    public function page($path = 'index')
    {
        if ('/' === mb_substr($path, -1)) {
            $path .= 'index';
        }
        $view = new View($path, ['layout' => 'layout']);
        if (!$view->isFound()) {
            throw new NotFound();
        }
        return $view->render();
    }

    /**
     * @Route(error=404)
     */
    public function notFound()
    {
        $view = new View('error404', ['layout' => 'layout']);
        return $view->render();
    }
}
