<?php

namespace App\Http\Controllers;

use App\Helper\Reply;
use App\Models\ProjectTag;
use Illuminate\Http\Request;

class ProjectTagController extends AccountBaseController
{
    public function __construct()
    {
        parent::__construct();
        $this->pageTitle = 'app.menu.projects';
        $this->activeSettingMenu = 'project_settings';
    }

    public function index()
    {
        $this->tags = ProjectTag::where('company_id', company()->id)->get();
        return view('project-tags.index', $this->data);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:7',
        ]);

        $tag = ProjectTag::create([
            'company_id' => company()->id,
            'name' => $request->name,
            'color' => $request->color ?? '#16813D',
        ]);

        return Reply::successWithData(__('messages.tagAdded'), ['tag' => $tag]);
    }

    public function destroy($id)
    {
        $tag = ProjectTag::where('company_id', company()->id)->findOrFail($id);
        $tag->delete();

        return Reply::success(__('messages.tagDeleted'));
    }
}
