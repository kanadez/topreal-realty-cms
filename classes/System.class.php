<?php

class System{
    public static function cpu(){
        $load = sys_getloadavg();
        return $load[0];
    }
}