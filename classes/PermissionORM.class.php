<?php

// этот класс используется как интерфейс к БД для класса Permission и как костыль. Поомучто нужно использовать сам 
// класс Permission как интерфейс. Костыль временный. Надо будет переделать

use Database\TinyMVCDatabase as DB;

class PermissionORM extends Database\TinyMVCDatabaseObject{
    const tablename  = 'permission';
    
}