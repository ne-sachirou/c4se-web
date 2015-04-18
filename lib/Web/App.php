<?php
namespace Web;

use Ranyuen\Little\Request;
use Ranyuen\Little\Router;

class App
{
    public function run()
    {
        Router::plugin('Ranyuen\Little\Plugin\ControllerAnnotationRouter');
        $router = new Router();
        require 'config/routes.php';
        $req = Request::createFromGlobals();
        $router->run($req)->send();
    }
}
