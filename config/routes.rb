Rails.application.routes.draw do
  root "welcome#index"
  resources :puzzles, only: %i[show update] do
    member do
      post :reset
    end
  end
end
