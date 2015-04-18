<?php
namespace Web;

class View
{
    private $layout;
    private $content;

    public function __construct($path, $option)
    {
        $this->content = "src/views/$path.html";
        if (isset($option['layout'])) {
            $this->layout = file_get_contents("src/views/{$option['layout']}.html");
        }
    }

    public function isFound()
    {
        return is_readable($this->content);
    }

    public function render()
    {
        $content = file_get_contents($this->content);
        $content = $this->renderPart($content);
        return $this->renderPart($this->layout, ['content' => $content]);
    }

    private function renderPart($content, $params = [])
    {
        $loader = new \Twig_Loader_Array(['current' => '']);
        $loader->setTemplate('current', $content);
        $loader = new \Twig_Loader_Chain(
            [
                $loader,
                new \Twig_Loader_Filesystem('src/views'),
            ]
        );
        $engine = new \Twig_Environment($loader);
        // $engine->addFilter(
        //     new \Twig_SimpleFilter(
        //         $name,
        //         function () use ($helper) {
        //             return call_user_func_array($helper, func_get_args());
        //         }
        //     )
        // );
        return $engine->render('current', $params);
    }
}
