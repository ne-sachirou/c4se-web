<?php
namespace Web\Controller;

use Web\View;

class IndexController
{
    /**
     * @Route('/')
     */
    public function index()
    {
        $view = new View('src/views/index.html', ['layout' => 'src/views/layout.html']);
        return $view->render();
    }
}
