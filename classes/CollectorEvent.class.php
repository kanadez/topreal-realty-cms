<?php

use Database as DB;

// event types: 1 = update

class CollectorEvent extends DB\TinyMVCDatabaseObject{
    const tablename  = 'collector_events';
}