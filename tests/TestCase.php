<?php

namespace Tests;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $compiledPath = sys_get_temp_dir().DIRECTORY_SEPARATOR.'voksvibe-tests-views-'.Str::uuid()->toString();

        File::ensureDirectoryExists($compiledPath);
        config()->set('view.compiled', $compiledPath);
    }
}
