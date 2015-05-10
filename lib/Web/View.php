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
        $content = new YamlFrontMatter($content);
        list($content, $params) = [$content->content, $content->params];
        $content = $this->renderPart($content, $params);
        $content = $this->translateBreadcrumb($content);
        $params  = array_merge($params, ['content' => $content]);
        return $this->renderPart($this->layout, $params);
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

    private function translateBreadcrumb($content)
    {
        return preg_replace_callback(
            '#<nav class="breadcrumb">(.+?)</nav>#ms',
            function ($matches) {
                $items = [];
                $i = 0;
                foreach (explode("\n", $matches[1]) as $line) {
                    $line = trim($line);
                    if (!$line) {
                        continue;
                    }
                    $items[] = [
                        'url'   => preg_split("/\s+/", $line)[0],
                        'title' => preg_replace('/\A\S+\s+/', '', $line),
                        'i'     => $i,
                    ];
                    ++$i;
                }
                return '<nav class="breadcrumb">'.array_reduce(
                    array_reverse($items),
                    function ($child, $item) {
                        $itemprop = 0 === $item['i'] ? '' : 'itemprop="child"';
                        return "<div itemscope itemtype=\"http://data-vocabulary.org/Breadcrumb\" $itemprop>
    <a href=\"{$item['url']}\" itemprop=\"url\">
        <span itemprop=\"title\">{$item['title']}</span>
    </a>
    $child
</div>";
                    },
                    ''
                ).'</nav>';
            },
            $content,
            1
        );
    }
}
