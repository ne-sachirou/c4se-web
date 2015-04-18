<?php
namespace Web;

class View
{
    private $layout;
    private $content;

    public function __construct($path, $option)
    {
        $this->content = file_get_contents($path);
        if (isset($option['layout'])) {
            $this->layout = file_get_contents($option['layout']);
        }
    }

    public function render()
    {
        $loader = new \Twig_Loader_Array(['current' => '']);
        $loader->setTemplate('current', $this->layout);
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
        return $engine->render('current', ['content' => $this->content]);
    }
}
