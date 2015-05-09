<?php
namespace Web;

use Symfony\Component\Yaml\Yaml;

class YamlFrontMatter
{
    public $content = '';
    public $params  = [];

    public function __construct($template)
    {
        $template = explode("\n", $template);
        if (!isset($template[0]) || '---' !== $template[0]) {
            $this->content = implode("\n", $template);
            return;
        }
        array_shift($template);
        if (false !== ($matterEnd = array_search('---', $template))) {
            $yaml          = implode("\n", array_slice($template, 0, $matterEnd));
            $this->content = implode("\n", array_slice($template, $matterEnd + 1));
        } else {
            $yaml = implode("\n", $template);
        }
        $this->params = Yaml::parse($yaml);
    }
}
