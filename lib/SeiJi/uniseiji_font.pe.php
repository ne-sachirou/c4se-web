<?php
function uOrd($char)
{
    return unpack('N', mb_convert_encoding($char, 'UCS-4BE', 'UTF-8'))[1];
}

$chars  = explode(' ', trim(fgets(STDIN)));
$charsO = $chars;
$chars  = array_map(
    function ($char) {
        return '0u'.dechex(uOrd($char));
    },
    $chars
);
?>#!/usr/bin/env fontforge

Open('../../src/fonts/NotoSansCJKjp-Regular.otf')
# CIDChangeSubFont('NotoSansCJKjp-Regular-Ideographs')
CIDFlatten()
Reencode('unicode')
<?php foreach ($chars as $i => $char) { ?>
if (InFont(<?php echo $char; ?>))
    Print("<?php echo $charsO[$i]; ?>")
    SelectMoreSingletons(<?php echo $char; ?>)
else
    Print("No <?php echo $charsO[$i]; ?>")
endif
<?php } ?>
SelectInvert()
Clear()
SetFondName('UniSeiJi')
Generate('../../lib/assets/uniseiji.ttf')
Close()
