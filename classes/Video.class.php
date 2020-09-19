<?php

use Database\TinyMVCDatabase as DB;

class Video extends Database\TinyMVCDatabaseObject{
    const tablename  = 'video';
    
    public static function getAll(){
        $query = DB::createQuery()->select('*')->where('deleted = 0'); 
        
        return self::getList($query, [null]);
    }
    
    public static function getBlock(){
        global $localization;
        $videos = self::getAll();
        
        $arr = $videos;
        $house = array();
        
        foreach ($arr as $key => $row){
            $house[$key] = $row->sort;
        }
        
        array_multisort($house, SORT_ASC, $arr);
        $sorted_videos = $arr;
        $video_localization = $localization->getVariableCurLocale("video");
        
        $video_block = '
            <button id="support_button" class="dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><i class="fa fa-video-camera"></i>&#160;&#160;'.$video_localization.'</button>
            <ul class="dropdown-menu" role="menu">';

        foreach ($sorted_videos as $v){
            $video_block .= '<li><a href="javascript:void(0)" onclick="openVideoModal(\''.$v->link.'\')">'.$v->title.'</a></li>';
        }
        
        $video_block .= "</ul>";
        
        return count($videos) > 0 ? $video_block : "";
    }
}