<?php

// этот класс используется как интерфейс к БД для класса Agency и как костыль. Поомучто нужно использовать сам 
// класс Agency как интерфейс. Костыль временный. Надо будет переделать

use Database\TinyMVCDatabase as DB;

class AgencyORM extends Database\TinyMVCDatabaseObject{
    const tablename  = 'agency';
    
}