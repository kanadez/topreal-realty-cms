<?php

class Log{
    const INFO_DISABLED = FALSE;
    const DEBUG_DISABLED = FALSE;
    
    public static function i($tag, $message){
        if (self::INFO_DISABLED){
            return FALSE;
        }
        
        $file_path = '/home/admin/web/topreal.top/public_html/logs/i.txt';
        $content_before = file_get_contents($file_path);
        file_put_contents($file_path, date('Y/m/d H:i:s')." ".$tag.": ".$message.PHP_EOL.$content_before);
    }
    
    public static function d($tag, $message){
        if (self::DEBUG_DISABLED){
            return FALSE;
        }
        
        $file_path = '/home/admin/web/topreal.top/public_html/logs/d.txt';
        $content_before = file_get_contents($file_path);
        file_put_contents($file_path, date('Y/m/d H:i:s')." ".$tag.": ".$message.PHP_EOL.$content_before);
    }
}